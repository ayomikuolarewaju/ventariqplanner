"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "loading" | "processing" | "ready-guide" | "ready-plan" | "error";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<Status>("loading");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    let cancelled = false;

    async function poll() {
      attempts += 1;

      try {
        const res = await fetch(
          `/api/orders/status?session_id=${encodeURIComponent(sessionId!)}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (data.status === "ready" && data.kind === "location_guide") {
          setDownloadUrl(data.downloadUrl);
          setStatus("ready-guide");
          return;
        }

        if (data.status === "ready" && data.kind === "plan") {
          setStatus("ready-plan");
          return;
        }

        // still pending/processing -- keep polling, up to ~30s
        if (attempts < 15) {
          setTimeout(poll, 2000);
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

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0D1420] px-6 py-24 text-white">
      <div className="w-full max-w-md rounded-[11px] border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#B8863B]">
          Payment Confirmed
        </p>

        {(status === "loading" || status === "processing") && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">
              Preparing your guide…
            </h1>
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
            <h1 className="font-serif text-3xl font-bold text-white">
              Your guide is ready.
            </h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              We&apos;ve also emailed a copy — this link is valid for 30
              minutes.
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
              <p className="mt-6 text-sm text-[#C9C2A8]">
                Check your email for the download link.
              </p>
            )}
          </>
        )}

        {status === "ready-plan" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">
              Check your inbox.
            </h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              Personalized plans need a few trip details first — we&apos;ve
              emailed a short intake form so we can build yours around
              your actual dates and preferences.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-serif text-3xl font-bold text-white">
              Still working on it.
            </h1>
            <p className="mt-4 text-[15px] text-[#C9C2A8]">
              Your payment went through, but confirmation is taking
              longer than usual. Check your email in a few minutes, or{" "}
              <a href="/resend-guide" className="underline hover:text-white">
                request your download link
              </a>{" "}
              if it doesn&apos;t arrive.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-white/10 pt-6">
          <a href="/events" className="text-sm text-[#C9C2A8] hover:text-white">
            Browse More Editions
          </a>
          <a href="/contact" className="text-sm text-[#C9C2A8] hover:text-white">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
