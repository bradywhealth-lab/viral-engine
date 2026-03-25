import { NextResponse } from "next/server";

interface AuctionResult {
  id: string;
  player: string;
  set: string;
  year: number;
  grade: string;
  soldPrice: number;
  soldAt: string;
  sourceUrl: string;
}

const MOCK_AUCTIONS: Record<string, AuctionResult[]> = {
  default: [
    {
      id: "1",
      player: "Michael Jordan",
      set: "1986 Fleer",
      year: 1986,
      grade: "PSA 9",
      soldPrice: 12500,
      soldAt: "2025-03-20",
      sourceUrl: "https://ebay.com",
    },
    {
      id: "2",
      player: "Ken Griffey Jr.",
      set: "1989 Upper Deck",
      year: 1989,
      grade: "PSA 10",
      soldPrice: 3200,
      soldAt: "2025-03-18",
      sourceUrl: "https://ebay.com",
    },
    {
      id: "3",
      player: "Tom Brady",
      set: "2000 Bowman Chrome",
      year: 2000,
      grade: "BGS 9.5",
      soldPrice: 8500,
      soldAt: "2025-03-15",
      sourceUrl: "https://ebay.com",
    },
    {
      id: "4",
      player: "Mickey Mantle",
      set: "1952 Topps",
      year: 1952,
      grade: "PSA 7",
      soldPrice: 45000,
      soldAt: "2025-03-12",
      sourceUrl: "https://ebay.com",
    },
    {
      id: "5",
      player: "LeBron James",
      set: "2003 Exquisite",
      year: 2003,
      grade: "BGS 9.5",
      soldPrice: 18000,
      soldAt: "2025-03-10",
      sourceUrl: "https://ebay.com",
    },
  ],
};

const generateMockAuctions = (query: string): AuctionResult[] => {
  const players = [
    "Michael Jordan",
    "Ken Griffey Jr.",
    "Tom Brady",
    "Mickey Mantle",
    "LeBron James",
    "Kobe Bryant",
    "Mike Trout",
    "Shohei Ohtani",
  ];
  const sets = [
    "Fleer",
    "Upper Deck",
    "Bowman Chrome",
    "Topps",
    "Exquisite",
    "Prizm",
    "National Treasures",
  ];
  const grades = ["PSA 9", "PSA 10", "BGS 9.5", "SGC 10", "PSA 8", "BGS 9"];

  const results: AuctionResult[] = [];
  const numResults = Math.floor(Math.random() * 4) + 5;

  for (let i = 0; i < numResults; i++) {
    const player = players[Math.floor(Math.random() * players.length)];
    const set = sets[Math.floor(Math.random() * sets.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const year = 1985 + Math.floor(Math.random() * 40);
    const daysAgo = Math.floor(Math.random() * 30);
    const soldAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    results.push({
      id: `${query}-${i}`,
      player: query.toLowerCase().includes("jordan")
        ? "Michael Jordan"
        : query.toLowerCase().includes("brady")
          ? "Tom Brady"
          : query.toLowerCase().includes("mantle")
            ? "Mickey Mantle"
            : query.toLowerCase().includes("griffey")
              ? "Ken Griffey Jr."
              : player,
      set: `${year} ${set}`,
      year,
      grade,
      soldPrice: Math.floor(Math.random() * 20000) + 500,
      soldAt,
      sourceUrl: "https://ebay.com",
    });
  }

  return results;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json(MOCK_AUCTIONS.default);
  }

  const results = generateMockAuctions(query);
  return NextResponse.json(results);
}
