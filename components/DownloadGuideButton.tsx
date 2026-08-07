"use client";

import { useState } from "react";

export default function DownloadGuideButton({
  eventSlug,
  locationSlug,
}: {
  eventSlug: string;
  locationSlug: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleDownload() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/guides/${eventSlug}/${locationSlug}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          res.status === 403
            ? "Purchase this guide to download it."
            : data.error ?? "Something went wrong."
        );
        return;
      }

      window.open(data.url, "_blank");
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={status === "loading"}
        className="rounded-[5px] border border-[#152238]/25 px-6 py-3 text-[15px] font-semibold text-[#152238] transition-colors hover:border-[#152238] disabled:opacity-50"
      >
        {status === "loading" ? "Preparing guide…" : "Download PDF Guide"}
      </button>

      {status === "error" && (
        <p className="mt-2 text-sm text-[#8C1C2B]">{errorMsg}</p>
      )}
    </div>
  );
}
