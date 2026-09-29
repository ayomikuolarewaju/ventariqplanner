import { Check, CircleAlert } from "lucide-react";
import StripeCheckoutSuccess from "@/components/StripeCheckoutSuccess";
import { createAdminClient } from "@/lib/supabase-admin";

const SUPPORT_EMAIL = "info@stratxct.com";

type PurchaseRecord = {
  status: string;
  amount: number | string;
  currency: string;
  downloads_used: number;
  download_limit: number;
  download_expires_at: string;
  download_assets: {
    asset_name: string | null;
  } | null;
};

function formatAmount(amount: number | string, currency: string) {
  const numericAmount = Number(amount);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(numericAmount);
  } catch {
    return `${currency.toUpperCase()} ${numericAmount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

function MessagePage({
  title,
  message,
  reference,
}: {
  title: string;
  message: string;
  reference?: string;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0D1420] px-5 py-16 text-white">
      <section className="w-full max-w-md border border-white/10 bg-white/[0.03] px-6 py-10 text-center sm:px-8">
        <CircleAlert className="mx-auto mb-5 h-9 w-9 text-[#B8863B]" aria-hidden="true" />
        <h1 className="font-serif text-2xl font-bold">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-[#C9C2A8]">{message}</p>
        {reference && (
          <p className="mt-5 break-all font-mono text-xs text-white/60">Reference: {reference}</p>
        )}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-7 inline-block text-sm text-[#C9C2A8] underline underline-offset-4 hover:text-white"
        >
          Contact support
        </a>
      </section>
    </main>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string | string[];
    session_id?: string | string[];
    download?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const reference = params.ref;

  if (typeof reference !== "string" || !reference.trim()) {
    if (params.session_id) return <StripeCheckoutSuccess />;

    return (
      <MessagePage
        title="Missing payment reference"
        message="We couldn’t find a payment reference in this link. Check your receipt or contact support."
      />
    );
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .select("status, amount, currency, downloads_used, download_limit, download_expires_at, download_assets(asset_name)")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error) {
    console.error("Purchase confirmation lookup failed:", error);
    return (
      <MessagePage
        title="Payment details unavailable"
        message="We couldn’t load this payment right now. Please try again shortly or contact support."
        reference={reference}
      />
    );
  }

  if (!data) {
    return (
      <MessagePage
        title="Payment not found"
        message="We couldn’t find a payment with this reference. Check your receipt or contact support."
        reference={reference}
      />
    );
  }

  const purchase = data as unknown as PurchaseRecord;

  if (purchase.status !== "success") {
    return (
      <MessagePage
        title={purchase.status === "failed" ? "Payment not confirmed" : "Confirming your payment"}
        message={
          purchase.status === "failed"
            ? "This payment was not completed. Contact support if you believe this is an error."
            : "Your payment is still being confirmed. Refresh this page in a moment to check again."
        }
        reference={reference}
      />
    );
  }

  const asset = purchase.download_assets;
  const downloadCount = Math.max(0, purchase.download_limit - purchase.downloads_used);
  const canDownload = downloadCount > 0;
  const formattedAmount = formatAmount(purchase.amount, purchase.currency);
  const downloadWasLimited = params.download === "limit";
  const downloadWasUnavailable = params.download === "unavailable";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0D1420] px-5 py-16 text-white">
      <section className="w-full max-w-md border border-white/10 bg-white/[0.03] px-6 py-9 sm:px-8">
        <div className="mx-auto mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-[#B8863B] text-[#B8863B]">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
        </div>
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#B8863B]">
          Payment confirmed
        </p>
        <h1 className="text-center font-serif text-2xl font-bold">Your planner is ready</h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#C9C2A8]">
          Your payment was received. Download your Planner below.
        </p>

        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[#C9C2A8]">{asset?.asset_name || "Your planner"}</dt>
            <dd className="shrink-0">{formattedAmount}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[#C9C2A8]">Reference</dt>
            <dd className="break-all text-right font-mono text-xs">{reference}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3 font-medium">
            <dt>Paid</dt>
            <dd>{formattedAmount}</dd>
          </div>
        </dl>

        {downloadWasLimited ? (
          <p className="mt-6 text-center text-sm leading-6 text-[#C9C2A8]">
            Your download limit has been reached or access has expired. Contact support and include your payment reference if you need more access.
          </p>
        ) : downloadWasUnavailable ? (
          <p className="mt-6 text-center text-sm leading-6 text-[#C9C2A8]">
            We couldn&apos;t prepare your download. Contact support and include your payment reference.
          </p>
        ) : canDownload ? (
          <a
            href={`/api/download/${encodeURIComponent(reference)}`}
            className="mt-6 block w-full bg-[#B8863B] px-6 py-3.5 text-center text-sm font-bold text-[#0D1420] transition-colors hover:bg-[#c99a4d]"
          >
            Download your Planner
          </a>
        ) : (
          <p className="mt-6 text-center text-sm leading-6 text-[#C9C2A8]">
            All download authorizations have been used. Contact support and include your payment reference if you need more access.
          </p>
        )}

        {!downloadWasLimited && !downloadWasUnavailable && canDownload && (
          <p className="mt-3 text-center text-xs text-white/45">
            {downloadCount} download {downloadCount === 1 ? "authorization" : "authorizations"} remaining. Access expires {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(purchase.download_expires_at))}.
          </p>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-white/50">
          Lost your link? <a href="/resend-planner" className="text-[#C9C2A8] underline underline-offset-2 hover:text-white">Email a fresh link</a>. Need more download access? Contact support.
        </p>

        <p className="mt-3 text-center text-xs leading-5 text-white/50">
          Need help with your purchase?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20with%20payment%20${encodeURIComponent(reference)}`}
            className="text-[#C9C2A8] underline underline-offset-2 hover:text-white"
          >
            Contact support
          </a>
          .
        </p>
      </section>
    </main>
  );
}
