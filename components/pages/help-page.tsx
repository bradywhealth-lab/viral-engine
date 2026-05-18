"use client";

import { BookOpen, Flame, HelpCircle, Lightbulb, Megaphone, Newspaper, Search, Settings, TrendingUp, Users2, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    icon: Users2,
    title: "Profiles",
    description: "Everything in Viral Engine is scoped to a Profile. Create one profile per niche or brand (e.g. sports cards, cooking, fitness). Switch profiles from the sidebar to keep content, trends, and campaigns separate.",
    steps: [
      "Click the profile switcher at the top of the sidebar",
      "Select \"Create new profile\" and enter a name and niche",
      "Set the platforms this profile targets (TikTok, Instagram, YouTube, etc.)",
      "All scans, content, and campaigns you create will attach to the active profile",
    ],
  },
  {
    icon: TrendingUp,
    title: "Trend Scanner",
    description: "Enter a keyword and niche, pick a platform, and the scanner mines live viral signals using Firecrawl — returning hashtags, trending sounds, top formats, and AI-generated content ideas.",
    steps: [
      "Select your profile first — scans are saved to the active profile",
      "Enter a keyword (e.g. \"PSA graded cards\") and your niche",
      "Choose a platform or select \"Scan all\" to cover every platform at once",
      "Review the trend score, hashtags, and AI content ideas",
      "Saved alerts appear in your Dashboard trend feed",
    ],
  },
  {
    icon: Newspaper,
    title: "Content Queue",
    description: "Generated content ideas land in your Content Queue as drafts. Review, edit, schedule, or mark them published from here.",
    steps: [
      "Use Trend Scanner or Content Generate to create ideas",
      "Open a draft to edit the caption and hashtags",
      "Set a scheduled date if you want to track when to post",
      "Mark items as Published once they go live",
    ],
  },
  {
    icon: Megaphone,
    title: "Campaigns",
    description: "Campaigns track your giveaway concepts through a draft → active → completed lifecycle. Use the Giveaways page to generate new campaign copy with AI, then manage their status here.",
    steps: [
      "Go to Giveaways to generate a campaign with AI",
      "The generated campaign starts as Draft in your Campaigns board",
      "Click Launch to move it to Active when the giveaway goes live",
      "Click Complete once the giveaway has ended",
    ],
  },
  {
    icon: Search,
    title: "Research",
    description: "Find untapped niches with AI-powered discovery, or search recent eBay and PWCC auction results for sports card pricing data.",
    steps: [
      "Click \"Find untapped niches\" to get AI-ranked niche opportunities",
      "Use the auction search to look up recent sales for specific players or cards",
      "Results show sold price, grade, and source links",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    description: "View and update your API keys, notification preferences, and account details.",
    steps: [
      "Navigate to Settings in the sidebar",
      "Update your OpenAI or Firecrawl key if they change",
      "Toggle notification preferences for trend alerts",
    ],
  },
];

const faqs = [
  {
    q: "Why is the trend scanner returning no results?",
    a: "Check that your FIRECRAWL_API_KEY is set correctly in your environment. If the key is missing or invalid, the scanner returns an empty result set rather than an error.",
  },
  {
    q: "Why can't I log in?",
    a: "Make sure you're accessing the app over HTTPS. The session cookie requires a secure connection. If you're running locally over HTTP, the cookie won't be set.",
  },
  {
    q: "Content I generated is gone after switching profiles.",
    a: "Content is scoped to the profile that was active when it was generated. Switch back to that profile to see it.",
  },
  {
    q: "The AI ideas from the trend scan don't match my niche.",
    a: "Be specific with your niche field. \"Sports cards\" produces better results than \"collectibles\". The more specific the niche, the more targeted the OpenAI content ideas.",
  },
  {
    q: "How do I add another account to manage?",
    a: "Go to Accounts in the sidebar and add a new social account. Accounts track your handles and platforms per profile.",
  },
];

export function HelpPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418]">Help Guide</h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Everything you need to get the most out of Viral Engine Views.</p>
      </div>

      <div className="rounded-[2rem] border border-[#e2d6c2] bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.10),transparent_50%),linear-gradient(135deg,#fffaf2,#f3e8d4)] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6a43d] to-[#f0c96a] text-white shadow-md">
            <Flame className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-[#2f2418]">Quick Start</h2>
        </div>
        <ol className="space-y-2 text-sm text-[#4c4033]">
          <li className="flex gap-2"><span className="font-semibold text-[#9a7b39]">1.</span> Create a Profile for your niche or brand</li>
          <li className="flex gap-2"><span className="font-semibold text-[#9a7b39]">2.</span> Run a Trend Scan to find what's viral right now</li>
          <li className="flex gap-2"><span className="font-semibold text-[#9a7b39]">3.</span> Generate content ideas from the scan results</li>
          <li className="flex gap-2"><span className="font-semibold text-[#9a7b39]">4.</span> Review and schedule from the Content Queue</li>
          <li className="flex gap-2"><span className="font-semibold text-[#9a7b39]">5.</span> Use Campaigns to run giveaways and track their status</li>
        </ol>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2d6c2] bg-white text-[#9a7b39]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#6f6254]">{section.description}</p>
                <ol className="space-y-1">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#4c4033]">
                      <span className="font-medium text-[#9a7b39] shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-[#9a7b39]" />
          <h2 className="text-xl font-semibold text-[#2f2418]">FAQ</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5">
              <div className="flex gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-[#9a7b39] shrink-0 mt-0.5" />
                <p className="font-medium text-[#2f2418] text-sm">{faq.q}</p>
              </div>
              <p className="text-sm text-[#6f6254] pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] p-5 flex items-start gap-3">
        <Zap className="h-5 w-5 text-[#9a7b39] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-[#2f2418] text-sm">Still stuck?</p>
          <p className="text-sm text-[#6f6254] mt-1">Use the AI Assistant in the sidebar — it can help you brainstorm content, plan your calendar, write captions, and more.</p>
        </div>
      </div>
    </div>
  );
}
