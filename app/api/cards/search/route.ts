import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseUnavailable } from "@/lib/database-errors";
import { getPrisma } from "@/lib/prisma";

const schema = z.object({
  player: z.string().min(1),
  set: z.string().min(1),
  year: z.coerce.number().int(),
  grade: z.coerce.number().optional(),
});

function parsePrice(text: string) {
  const match = text.match(/\$([\d,]+(?:\.\d{2})?)/);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${body.player} ${body.set} ${body.year} sports card sold`,
        limit: 5,
      }),
    });

    const searchData = (await firecrawlResponse.json()) as {
      data?: Array<{ title?: string; description?: string; url?: string; publishedDate?: string }>;
    };

    const listings =
      searchData.data?.map((result, index) => {
        const mergedText = `${result.title ?? ""} ${result.description ?? ""}`;
        return {
          id: `${index}-${result.url ?? "listing"}`,
          title: result.title ?? "Sold listing",
          soldPrice: parsePrice(mergedText) ?? 0,
          soldAt: result.publishedDate ?? new Date().toISOString(),
          sourceUrl: result.url ?? "#",
          sourcePlatform: "ebay",
        };
      }) ?? [];

    const averagePrice =
      listings.length > 0 ? listings.reduce((sum, listing) => sum + listing.soldPrice, 0) / listings.length : 0;
    const trendDirection =
      listings.length > 1 && listings[0].soldPrice >= listings[listings.length - 1].soldPrice ? "up" : "down";

    let usedFallback = false;
    try {
      const prisma = await getPrisma();
      await Promise.all(
        listings
          .filter((listing) => listing.soldPrice > 0)
          .map((listing) =>
            prisma.cardListing.create({
              data: {
                player: body.player,
                set: body.set,
                year: body.year,
                grade: body.grade ?? null,
                soldPrice: listing.soldPrice,
                soldAt: new Date(listing.soldAt),
                sourceUrl: listing.sourceUrl,
                sourcePlatform: listing.sourcePlatform,
              },
            }),
          ),
      );
    } catch (persistError) {
      console.error(persistError);
      if (isDatabaseUnavailable(persistError)) {
        usedFallback = true;
      } else {
        throw persistError;
      }
    }

    return NextResponse.json(
      { listings, averagePrice, trendDirection },
      usedFallback ? { headers: { "x-data-source": "fallback" } } : undefined,
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to search card listings" }, { status: 500 });
  }
}
