// lib/intelligence-articles.ts
//
// Static content for now -- structured as typed blocks so the article
// page can render the same Verified/Insight/Time Saver/Money Saver/
// Avoid This Mistake/Not Yet Confirmed callout system used on the
// homepage's "Ventariq Difference" section. If this grows past a
// handful of articles, this is a natural candidate to move into a
// Supabase table with an admin editor later.

export type CalloutKind =
  | "verified"
  | "insight"
  | "timeSaver"
  | "moneySaver"
  | "avoid"
  | "notConfirmed";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; kind: CalloutKind; text: string }
  | { type: "numbered"; items: { heading: string; text: string }[] }
  | { type: "takeaway"; title: string; text: string };

export type Article = {
  slug: string;
  title: string;
  category: string;
  publishedDate: string;
  readingTime: string;
  excerpt: string;
  blocks: ContentBlock[];
};

export const CALLOUT_META: Record<
  CalloutKind,
  { label: string; bg: string; text: string }
> = {
  verified: { label: "✅ VERIFIED", bg: "#EAECF1", text: "#152238" },
  insight: { label: "💡 VENTARIQ INSIGHT", bg: "#FBF4E6", text: "#8C6423" },
  timeSaver: { label: "⏱ TIME SAVER", bg: "#EDF0F5", text: "#2A3E5C" },
  moneySaver: { label: "💰 MONEY SAVER", bg: "#FBF0DE", text: "#8C6423" },
  avoid: { label: "⚠ AVOID THIS MISTAKE", bg: "#FBEAEC", text: "#8C1C2B" },
  notConfirmed: { label: "⚪ NOT YET CONFIRMED", bg: "#F0F0EE", text: "#5A6472" },
};

export const articles: Article[] = [
  {
    slug: "closest-hotel-not-best-hotel",
    title: "Why the Closest Hotel May Not Be the Best Hotel",
    category: "Where to Stay",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "Distance on a map doesn't tell the whole story. Measure friction, not miles.",
    blocks: [
      { type: "paragraph", text: "When attending a major event, it's natural to search for accommodation close to the venue." },
      { type: "paragraph", text: "But distance doesn't tell the whole story." },
      { type: "paragraph", text: "A hotel that appears close on a map could still require inconvenient transportation, multiple connections, considerable walking, or repeated rideshare trips. Another hotel farther away may offer a much simpler journey." },
      { type: "callout", kind: "insight", text: "Don't measure hotel convenience only in miles. Measure the friction involved in staying there." },
      { type: "list", items: [
        "How will you get from the hotel to the event?",
        "How complicated is the journey?",
        "How will you return after the event?",
        "What could transportation add to your overall trip cost?",
        "How easily can you reach the other places you want to experience?",
      ]},
      { type: "paragraph", text: "A hotel shouldn't be evaluated in isolation from the rest of your trip." },
      { type: "callout", kind: "moneySaver", text: "Don't compare room prices alone. A lower nightly rate doesn't necessarily produce a lower total trip cost if the location creates additional transportation expenses. Likewise, paying more for accommodation doesn't automatically make it the better choice. The objective is to understand the combination of price, location, transportation and convenience that works for your trip." },
      { type: "takeaway", title: "Closest ≠ Most Convenient", text: "Think beyond the distance on the map." },
    ],
  },
  {
    slug: "getting-there-is-only-half",
    title: "Getting There Is Only Half Your Transportation Plan",
    category: "Getting There & Around",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "You know how you're getting to the event. But how are you getting back?",
    blocks: [
      { type: "paragraph", text: "You know how you're getting to the event. But how are you getting back?" },
      { type: "paragraph", text: "Travelers can spend considerable time planning the journey to a venue while giving much less thought to what happens when the event finishes." },
      { type: "paragraph", text: "Departure conditions can be different. You may be leaving later in the evening. Large numbers of attendees may be departing around the same time. Transportation frequency, traffic conditions or pickup arrangements may also differ from when you arrived." },
      { type: "callout", kind: "insight", text: "Treat your return journey as a separate planning decision, rather than assuming that reversing your arrival route will automatically be the best option." },
      { type: "list", items: [
        "What's my preferred return route?",
        "Will the transportation I intend to use still be operating when I leave?",
        "Where do I need to go after exiting the venue?",
        "What alternative do I have if my first option becomes impractical?",
      ]},
      { type: "callout", kind: "timeSaver", text: "Save important information before leaving for the event — your accommodation address, transportation information and any important directions you'll want later. The objective isn't to prepare for every possible problem. It's to avoid having to start your transportation research from scratch at the end of a long event day." },
      { type: "takeaway", title: "Getting there is only half your transportation plan.", text: "Plan the return before you leave." },
    ],
  },
  {
    slug: "three-things-to-check-before-leaving",
    title: "Three Things to Check Before Leaving for a Major Event",
    category: "Event-Day Intelligence",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "You've planned the trip. You have your ticket. Before heading to the venue, check these three things.",
    blocks: [
      { type: "paragraph", text: "You've planned the trip. You have your ticket. You're ready to leave." },
      { type: "paragraph", text: "Before heading to the venue, there are three categories of information worth checking." },
      { type: "numbered", items: [
        { heading: "Bag Policy", text: "Find out what type and size of bag the venue currently permits. Don't assume that because something was permitted at another venue — or even at the same venue previously — the current event follows the same rules." },
        { heading: "Prohibited Items", text: "Check the event or venue's current prohibited-items information. Something perfectly ordinary to carry while traveling may not necessarily be permitted inside a particular venue." },
        { heading: "Entry Information", text: "Review the current official information relevant to entering the event. Depending on the event, this may include information about tickets, entrances, security procedures or other admission requirements." },
      ]},
      { type: "callout", kind: "avoid", text: "Don't rely on an old article, an old social-media post, another visitor's experience, or what happened at a different event when the information can be checked directly. For venue rules and entry requirements, the current official event or venue source should be your final reference." },
      { type: "takeaway", title: "Check before you go.", text: "A few minutes of verification can prevent unnecessary friction when you arrive." },
    ],
  },
  {
    slug: "more-information-not-always-better-planning",
    title: "Why More Travel Information Doesn't Always Mean Better Planning",
    category: "Travel Intelligence",
    publishedDate: "September 2026",
    readingTime: "4 minutes",
    excerpt:
      "Finding information and making a decision aren't the same thing.",
    blocks: [
      { type: "paragraph", text: "Travelers today have access to an extraordinary amount of information. Search for accommodation and you'll find countless options. Search for restaurants and you'll find even more. Maps can suggest routes. Reviews can tell you what other visitors experienced. AI can help answer individual travel questions." },
      { type: "paragraph", text: "Yet planning can still feel complicated. Why? Because finding information and making a decision aren't the same thing." },
      { type: "paragraph", text: "The difficult questions are often contextual:" },
      { type: "list", items: [
        "Which area makes sense for my event and schedule?",
        "Which transportation option makes sense at the time I'll actually be traveling?",
        "Does a cheaper hotel remain cheaper after transportation is considered?",
        "Is the information I'm reading current?",
        "How much time should I realistically allow between activities?",
      ]},
      { type: "callout", kind: "insight", text: "Travel planning isn't simply about collecting more options. It's about understanding how different decisions interact. Where you stay can affect transportation. Transportation can affect available time. Your event schedule can affect when and where you eat. Your arrival and departure arrangements can affect what you can realistically do on those days. That's the distinction Ventariq makes between travel information and Event Travel Intelligence." },
      { type: "paragraph", text: "The objective isn't more tabs. It's better context for making decisions." },
      { type: "takeaway", title: "Information gives you options. Intelligence helps you decide.", text: "" },
    ],
  },
  {
    slug: "airport-arrival-time-is-not-available-time",
    title: "Airport Arrival Time Is Not Available Time",
    category: "Travel Planning",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "Your flight lands at 3pm. Something important is at 5pm. Two hours sounds like plenty — but is it?",
    blocks: [
      { type: "paragraph", text: "Your flight is scheduled to land at 3:00 p.m. You've found something important you'd like to do at 5:00 p.m. Two hours sounds like plenty of time. But is it?" },
      { type: "paragraph", text: "Your scheduled arrival time isn't necessarily the time you'll be ready for your next activity. Depending on your journey, there may still be several steps between landing and becoming available for the rest of your trip — for example, deplaning, border formalities where applicable, collecting luggage, ground transportation and reaching your accommodation." },
      { type: "paragraph", text: "Unexpected delays can narrow the window further." },
      { type: "callout", kind: "insight", text: "When planning your arrival day, distinguish between scheduled arrival time and realistically available time. They aren't necessarily the same." },
      { type: "callout", kind: "avoid", text: "Be especially careful about placing something expensive, difficult to reschedule or personally important immediately after your expected arrival. The more serious the consequence of missing something, the more valuable an appropriate time buffer becomes." },
      { type: "takeaway", title: "Airport Arrival Time ≠ Available Time", text: "Build your arrival day around realistic availability rather than the scheduled landing time alone." },
    ],
  },
  {
    slug: "what-to-plan-first-for-an-event-trip",
    title: "What Should You Plan First for an Event Trip?",
    category: "Planning Intelligence",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "Flights, hotels, restaurants, transportation, sightseeing — those decisions aren't independent of one another.",
    blocks: [
      { type: "paragraph", text: "When planning travel around a major event, it's easy to research everything at once — flights, hotels, restaurants, transportation, sightseeing, the event itself. But those decisions aren't independent of one another." },
      { type: "callout", kind: "insight", text: "Start by understanding the parts of your trip that are hardest to change. Your event date or session time, for example, may constrain many of the decisions around it. Once you understand those commitments, you can evaluate accommodation, transportation and other choices in relation to them." },
      { type: "paragraph", text: "A hotel may look excellent on its own. A restaurant may have great reviews. An attraction may be highly recommended. But the more useful question is: does this choice make sense within the trip I'm actually taking?" },
      { type: "callout", kind: "avoid", text: "Don't evaluate every part of an event trip independently. A good individual choice can still create a poor overall itinerary when it doesn't fit your schedule, location or transportation needs." },
      { type: "takeaway", title: "Start with what matters most to the trip. Then evaluate the other decisions around it.", text: "Good event travel planning is about how the pieces work together." },
    ],
  },
  {
    slug: "how-to-read-ventariq-intelligence",
    title: "How to Read Ventariq Intelligence",
    category: "About the Intelligence Desk",
    publishedDate: "September 2026",
    readingTime: "3 minutes",
    excerpt:
      "Not every piece of travel information carries the same level of certainty — here's what each label actually means.",
    blocks: [
      { type: "paragraph", text: "Not every piece of travel information serves the same purpose or carries the same level of certainty. Ventariq uses intelligence labels to help readers understand the nature of the information they're reading." },
      { type: "callout", kind: "verified", text: "Information checked against a source Ventariq considers authoritative for that particular fact at the stated time of verification. Verified does not mean permanently true — schedules, prices, policies, availability and other information can change after verification. Where current information could materially affect your plans, check the relevant official source before making a final decision." },
      { type: "callout", kind: "insight", text: "Ventariq's analysis, interpretation or planning perspective. It is designed to help travelers think through a decision and should not be confused with an official event rule or guarantee." },
      { type: "callout", kind: "timeSaver", text: "A planning approach that may help reduce unnecessary research, waiting or travel friction. Individual results will vary." },
      { type: "callout", kind: "moneySaver", text: "An opportunity or planning approach that may help reduce unnecessary spending. Actual costs and potential savings depend on individual circumstances, availability, timing and third-party pricing." },
      { type: "callout", kind: "avoid", text: "A potential planning issue or source of unnecessary friction that travelers may want to consider." },
      { type: "callout", kind: "notConfirmed", text: "Information that Ventariq has not been able to confirm to the standard required for presenting it as verified. Rather than presenting uncertain information as established fact, we identify the uncertainty." },
      { type: "paragraph", text: "Understanding Our Dates — different Intelligence Desk publications may display different dates depending on the nature of the content. Published is when the article was originally released. Updated is when it received a meaningful editorial revision. Last Verified is when time-sensitive factual information was most recently checked against relevant sources. Evergreen planning articles may not display a Last Verified date when their content doesn't depend materially on changing external facts." },
      { type: "paragraph", text: "Our Editorial Principle: Ventariq distinguishes between what a source establishes and what Ventariq recommends or concludes from the available information. That distinction is central to our approach to Event Travel Intelligence." },
      { type: "takeaway", title: "Trust. Simplicity. Reliability.", text: "Ventariq — Event Travel Intelligence. Plan Less. Experience More." },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
