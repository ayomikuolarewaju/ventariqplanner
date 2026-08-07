// app/checkout/success/page.tsx

/**
 * /checkout/success — ComfortLifeUS
 *
 * No auth required, no order lookup by session -- delivery happens via
 * email (the Stripe webhook sends the PDF or intake link directly), so
 * this page just needs to confirm the payment went through and tell
 * the buyer to check their inbox. Simpler and matches the no-login flow.
 */

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="w-full max-w-md rounded-xl bg-[#142050] p-8 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-[#F5B301]">
          PAYMENT CONFIRMED
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-wide">
          Check your inbox.
        </h1>
        <p className="mt-4 text-blue-200">
          Your guide is on its way — for personalized plans, we&apos;ll
          send a short intake form first so we can build it around your
          trip.
        </p>

        <a
          href="/events"
          className="mt-8 inline-block rounded bg-[#E8002D] px-6 py-3 font-bold transition-transform hover:-translate-y-0.5"
        >
          Browse More Events
        </a>

        <p className="mt-6 text-xs text-white/40">
          No email yet? Check spam, or{" "}
          <a href="/contact" className="underline hover:text-white">
            contact us
          </a>
          .
        </p>
      </div>
    </main>
  );
}
