"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS =[
  {
    "q": "How is a Ventariq planner different from a free travel blog?",
    "a": "A travel blog can be great for inspiration. Ventariq is built for something different: making decisions around a specific event trip. Instead of sending you across multiple websites to piece together venue information, transportation, where to stay, dining, event-day planning and destination ideas, Ventariq organizes the information you’re likely to need into one structured experience. Our planners also use clear intelligence labels — including Verified, Ventariq Insight, Time Saver, Money Saver, Avoid This Mistake, and Not Yet Confirmed — to help distinguish confirmed information from recommendations, planning insights and details that may still change. Each planner is also dated and versioned, so you know when the information was prepared. The goal is simple: less searching, less guesswork, and more confidence in the decisions you make."
  },
  {
    "q": "Why should I pay for information I can find online for free?",
    "a": "Because you’re not paying simply for access to information. You’re paying for the research, comparison, organization and planning context that turns scattered information into something you can actually use. You could research the event, compare neighborhoods, study transportation options, find restaurants, check venue rules, build an itinerary and keep track of official updates yourself. Ventariq is designed to reduce that work by bringing the most useful planning intelligence together around one event experience. If you enjoy doing all of that research yourself, you may not need Ventariq. If you’d rather spend less time researching and more time preparing to enjoy the trip, that’s where we provide value."
  },
  {
    "q": "Why use Ventariq when I can ask Google or AI?",
    "a": "Google and AI are excellent tools for finding and exploring information. Ventariq solves a different problem. Instead of starting with a blank search box and working through question after question, a Ventariq planner has already been researched and structured around the decisions an event traveler is likely to face — where to stay, how to move around, what to know before event day, where to eat, what mistakes to avoid and what else to experience while you’re there. We also distinguish between verified information, planning insights and details that are not yet confirmed. Ventariq doesn’t exist because information is unavailable. It exists because planning with scattered information takes time."
  },
  {
    "q": "What does “Verified” mean in a Ventariq planner?",
    "a": "Verified means the information was checked against a source Ventariq considers authoritative for that particular fact at the time the planner was researched or updated. It does not mean the information can never change. That’s why every planner is dated and why time-sensitive information should still be checked through the Live Information Hub or the relevant official source before you rely on it."
  },
  {
    "q": "What do the Ventariq intelligence labels mean?",
    "a": "Our labels help you quickly understand the type of information you’re reading. Verified means the information was checked against an authoritative source. Ventariq Insight means it is our planning analysis or recommendation. Time Saver identifies an opportunity to reduce unnecessary time or friction. Money Saver identifies an opportunity that may help reduce unnecessary spending. Avoid This Mistake highlights a planning issue worth watching for. Not Yet Confirmed means the information wasn’t sufficiently confirmed when the planner was prepared. They’re designed to help you read intelligently rather than treating every piece of travel information as though it carries the same level of certainty."
  },
  {
    "q": "Is Ventariq a booking service?",
    "a": "No. Ventariq is an Event Travel Intelligence service, not a travel agency or booking platform. We help you understand your options and plan more confidently. Where useful, planners may direct you to official or relevant third-party services for tickets, transportation, accommodations or other travel needs, but you make your own bookings directly with those providers. That means you remain in control of your trip and your purchasing decisions."
  },
  {
    "q": "How do I get my planner after I pay?",
    "a": "Immediately. Once your payment is successfully processed, your planner will be delivered to the email address you used at checkout as a downloadable PDF. There’s no account to create and no waiting for manual delivery. If you don’t see the email within a few minutes, check your spam or junk folder."
  },
  {
    "q": "I lost my planner. Do I have to buy it again?",
    "a": "No. Use Resend My Planner with the email address you used when purchasing, and we’ll send you another copy. Losing the original email shouldn’t mean paying twice for the same planner."
  },
  {
    "q": "Can I buy a planner for a group?",
    "a": "Ventariq planners are licensed for personal use and your traveling party, rather than redistribution or resale. If you’re organizing travel for a larger group, organization or other special use, contact us about available group arrangements."
  },
  {
    "q": "What is your refund policy?",
    "a": "Because Ventariq planners are digital products delivered immediately after purchase, sales are generally final once the planner has been delivered. However, if something goes wrong — such as a duplicate charge, delivery problem or accidental purchase of the wrong event — contact us. We’ll review legitimate purchase issues and work to resolve them fairly."
  },
  {
    "q": "Is Ventariq an official product of the event I’m attending?",
    "a": "No. Ventariq planners are independently researched and produced by Ventariq, a product of StratX Solutions LLC. Unless explicitly stated otherwise, Ventariq is not affiliated with, sponsored by, endorsed by or officially connected to the events, venues or organizations covered in our planners. We use official and authoritative sources where appropriate when researching factual information, but Ventariq’s planner itself is an independent product."
  },
  {
    "q": "How current is the information in my planner?",
    "a": "Every Ventariq planner is dated and versioned so you can see when its information was prepared or last updated. But major events are dynamic. Schedules, prices, transportation, venue policies and other details can change after publication. That’s why we identify information that isn’t yet confirmed and provide a Live Information Hub for important information that should be checked again close to your trip."
  },
  {
    "q": "What if something changes after I download my planner?",
    "a": "That’s exactly why Ventariq planners include a Live Information Hub. The Hub provides convenient access to official sources for time-sensitive information such as schedules, tickets, transportation and venue updates. A downloaded PDF cannot reflect every real-time change automatically, so the Live Information Hub helps bridge the gap between the researched planner and information that may continue changing. We recommend checking relevant official information again shortly before traveling and before your event."
  },
  {
    "q": "Does Ventariq guarantee prices, schedules or availability?",
    "a": "No. Prices, schedules, ticket availability, transportation services, operating hours and other third-party information can change — sometimes with little notice. Ventariq provides researched planning intelligence based on information available when a planner is prepared or updated, but the relevant provider or event organizer remains the authoritative source for current availability and final transaction details."
  },
  {
    "q": "Do I need to be tech-savvy to use Ventariq?",
    "a": "Not at all. Your planner is delivered as a PDF. You can read it on your phone, tablet or computer, save it for easy access, or print it if you prefer paper. No special app is required to read the planner. For features such as QR codes and live links, you’ll simply need an internet-connected device when accessing the linked information."
  },
  {
    "q": "Can I use my planner offline?",
    "a": "Mostly, yes. Once you’ve downloaded the PDF to your device, the planner itself can be read without an internet connection. However, external links, QR-code destinations and the Live Information Hub require internet access. Download your planner before traveling so the core information remains available even when connectivity isn’t."
  },
  {
    "q": "Will Ventariq cover other events?",
    "a": "Yes. Ventariq is being built to support travelers attending major events across sports, film, music, festivals, conferences, culture and other major event categories. Visit Current Events to see planners currently available and what’s coming next. Our goal is bigger than any single tournament or festival: to make major-event travel easier to understand, plan and experience."
  }
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main>
      <section className="bg-[#0D1420] py-20 text-white">
        <div className="container">
          <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
            Frequently Asked Questions
          </p>
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.07] text-white">
            Everything you might want to know first.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="divide-y divide-[#D8D2C2] rounded-[11px] border border-[#D8D2C2] bg-white">
            {FAQS.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-serif text-[17px] text-[#152238]">
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 text-xl text-[#B8863B] transition-transform ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-5 text-[14.5px] leading-[1.6] text-[#5A6472]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[14px] text-[#5A6472]">
            Still have a question?{" "}
            <Link href="/contact" className="font-semibold text-[#152238] hover:text-[#8C6423]">
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
