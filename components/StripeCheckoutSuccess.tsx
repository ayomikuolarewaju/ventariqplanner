"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Status =
  | "loading"
  | "processing"
  | "ready-guide"
  | "ready-plan"
  | "manual-review"
  | "already-claimed"
  | "error";

const SUPPORT_EMAIL = "info@stratxct.com";
const MAX_WAIT_MS = 60_000;
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = Math.floor(MAX_WAIT_MS / POLL_INTERVAL_MS);

function trackPurchaseOnce(
  sessionId: string,
  amountCents?: number,
  currency?: string,
  retriesLeft = 10
) {
  const key = `ventariq-purchase-tracked-${sessionId}`;
  if (sessionStorage.getItem(key)) return;

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        currency: (currency ?? "usd").toUpperCase(),
        value: (amountCents ?? 0) / 100,
      },
      { eventID: sessionId }
    );
    sessionStorage.setItem(key, "1");
    return;
  }

  if (retriesLeft > 0) {
    setTimeout(
      () => trackPurchaseOnce(sessionId, amountCents, currency, retriesLeft - 1),
      300
    );
  }
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>("loading");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const activeSessionId = sessionId;

    let attempts = 0;
    let cancelled = false;

    async function readJsonResponse(response: Response) {
      const raw = await response.text();
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return { error: raw || `Request failed (${response.status})` };
      }
    }

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/orders/status?session_id=${encodeURIComponent(activeSessionId)}`
        );
        const data = await readJsonResponse(res);
        if (cancelled) return;

        if (data.status === "already_claimed") {
          setStatus("already-claimed");
          return;
        }
        if (data.status === "manual_review") {
          setStatus("manual-review");
          return;
        }
        if (data.status === "ready" && data.kind === "instant_download") {
          setDownloadUrl(data.downloadUrl);
          setStatus("ready-guide");
          trackPurchaseOnce(activeSessionId, data.amountCents, data.currency);
          return;
        }
        if (data.status === "ready" && data.kind === "plan") {
          setStatus("ready-plan");
          trackPurchaseOnce(activeSessionId, data.amountCents, data.currency);
          return;
        }
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    const redirectStates: Status[] = ["ready-guide", "ready-plan", "already-claimed"];
    if (!redirectStates.includes(status)) return;
    const timer = setTimeout(() => router.push("/"), 15_000);
    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0D1420] px-6 py-24 text-white">
      <div className="w-full max-w-md rounded-[11px] border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
          Payment Confirmed
        </p>
        {(status === "loading" || status === "processing") && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Preparing your guide…</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              This usually takes a few seconds. Don&apos;t close this tab.
            </p>
            <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 animate-pulse bg-[#B8863B]" />
            </div>
          </>
        )}
        {status === "ready-guide" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Your guide is ready.</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              We&apos;ve emailed a controlled download link too. You have three download authorizations over seven days; each link is valid for five minutes.
            </p>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block rounded-[5px] bg-[#B8863B] px-7 py-3.5 text-[15px] font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
              >
                Download Your Guide
              </a>
            ) : (
              <p className="mt-6 text-sm text-[#C9C2A8]">Check your email for the download link.</p>
            )}
          </>
        )}
        {status === "ready-plan" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Check your inbox.</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              Personalized plans need a few trip details first — we&apos;ve emailed a short intake form so we can build yours around your actual dates and preferences.
            </p>
          </>
        )}
        {status === "already-claimed" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Already delivered.</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              This guide was already downloaded and emailed to you. If you need it resent, contact us directly at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-white">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </>
        )}
        {status === "manual-review" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Almost there.</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              Your payment went through, but we need to prepare your guide by hand. We&apos;ll email it to you shortly — no action needed from you.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">Still working on it.</h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              Your payment went through, but confirmation is taking longer than usual. Check your email in a few minutes, or contact us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-white">
                {SUPPORT_EMAIL}
              </a>{" "}
              if it doesn&apos;t arrive.
            </p>
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-white/10 pt-6">
          <Link href="/events" className="text-sm text-[#C9C2A8] hover:text-white">
            Browse More Editions
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20with%20my%20purchase`}
            className="text-sm text-[#C9C2A8] hover:text-white"
          >
            Email Support
          </a>
        </div>
        {(status === "ready-guide" || status === "ready-plan" || status === "already-claimed") && (
          <p className="mt-5 text-[12px] text-white/30">Taking you back to the homepage shortly…</p>
        )}
      </div>
    </main>
  );
}

export default function StripeCheckoutSuccess() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}