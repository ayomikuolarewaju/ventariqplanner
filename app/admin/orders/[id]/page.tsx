import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  PackageCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import ResendOrderButton from "@/components/ResendOrderButton";

const STATUS_META: Record<string, { label: string; className: string }> = {
  fulfilled: {
    label: "Fulfilled",
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  processing: {
    label: "Processing",
    className: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  },
  awaiting_intake: {
    label: "Awaiting intake",
    className: "border-sky-300/25 bg-sky-300/10 text-sky-200",
  },
  failed: {
    label: "Needs review",
    className: "border-rose-300/25 bg-rose-300/10 text-rose-200",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount == null) return "Not available";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amount / 100);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-[#B8863B]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">{label}</p>
        <div className="mt-1 break-words text-sm text-white/80">{value}</div>
      </div>
    </div>
  );
}

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers(*),
      travel_intake(*)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return (
      <main className="container py-12">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft size={15} aria-hidden="true" /> Back to orders
        </Link>
        <div className="mt-10 rounded-xl border border-white/10 bg-[#101b3d] px-6 py-14 text-center">
          <h1 className="text-2xl font-semibold text-white">Order not found</h1>
          <p className="mt-2 text-sm text-white/45">No order matches this ID.</p>
        </div>
      </main>
    );
  }

  const status = STATUS_META[order.fulfillment_status || ""] ?? {
    label: order.fulfillment_status || "Unknown",
    className: "border-white/15 bg-white/5 text-white/65",
  };
  const customer = order.customers;

  return (
    <main className="container py-10">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
        <ArrowLeft size={15} aria-hidden="true" /> Back to orders
      </Link>

      <header className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B8863B]">Order details</p>
          <h1 className="mt-2 break-all text-2xl font-semibold text-white sm:text-3xl">{order.product_sku || "Planner order"}</h1>
          <p className="mt-2 font-mono text-xs text-white/35">{order.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}>
            <CheckCircle2 size={14} aria-hidden="true" />
            {status.label}
          </span>
          <ResendOrderButton orderId={order.id} />
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-xl border border-white/10 bg-[#101b3d] p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <UserRound size={18} className="text-[#B8863B]" aria-hidden="true" />
            <h2 className="font-semibold text-white">Customer and payment</h2>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <DetailItem icon={UserRound} label="Customer" value={customer?.full_name || "Guest customer"} />
            <DetailItem
              icon={Mail}
              label="Email"
              value={customer?.email ? <a className="text-[#d7b26b] hover:text-white" href={`mailto:${customer.email}`}>{customer.email}</a> : "No email recorded"}
            />
            <DetailItem icon={CreditCard} label="Amount" value={formatAmount(order.amount_cents, order.currency)} />
            <DetailItem icon={CheckCircle2} label="Payment status" value={order.payment_status || "Not available"} />
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#101b3d] p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <PackageCheck size={18} className="text-[#B8863B]" aria-hidden="true" />
            <h2 className="font-semibold text-white">Delivery</h2>
          </div>
          <div className="mt-6 space-y-5">
            <DetailItem icon={CalendarDays} label="Placed" value={formatDate(order.created_at)} />
            <DetailItem icon={FileText} label="Linked asset" value={order.download_asset_id ? "Asset linked" : "No asset linked"} />
            <DetailItem icon={PackageCheck} label="Delivery state" value={status.label} />
          </div>
          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-xs leading-5 text-white/45">Resend attempts are available for every order state. The action will explain if a downloadable planner is not linked.</p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-[#101b3d] p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-[#B8863B]" aria-hidden="true" />
            <h2 className="font-semibold text-white">Trip information</h2>
          </div>
          <ArrowUpRight size={16} className="text-white/25" aria-hidden="true" />
        </div>
        <pre className="mt-5 overflow-x-auto rounded-lg border border-white/10 bg-[#0c1530] p-4 text-xs leading-6 text-white/60">
          {JSON.stringify(order.travel_intake ?? null, null, 2)}
        </pre>
      </section>
    </main>
  );
}
