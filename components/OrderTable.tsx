"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  PackageCheck,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import ResendOrderButton from "@/components/ResendOrderButton";

type OrderRow = {
  id: string;
  product_sku: string | null;
  fulfillment_status: string | null;
  download_asset_id: string | null;
  created_at?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  customers?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const STATUS_OPTIONS = ["all", "fulfilled", "processing", "awaiting_intake", "failed"];

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  fulfilled: {
    label: "Fulfilled",
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    className: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    icon: Clock3,
  },
  awaiting_intake: {
    label: "Awaiting intake",
    className: "border-sky-300/25 bg-sky-300/10 text-sky-200",
    icon: Mail,
  },
  failed: {
    label: "Needs review",
    className: "border-rose-300/25 bg-rose-300/10 text-rose-200",
    icon: AlertCircle,
  },
};

function formatProductSku(sku: string | null) {
  return sku?.replaceAll("_", " ") || "Unknown product";
}

function formatAmount(order: OrderRow) {
  if (order.amount_cents == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (order.currency || "usd").toUpperCase(),
  }).format(order.amount_cents / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string | null }) {
  const meta = STATUS_META[status || ""] ?? {
    label: status || "Unknown",
    className: "border-white/15 bg-white/5 text-white/65",
    icon: AlertCircle,
  };
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
    >
      <Icon size={13} strokeWidth={2.2} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export default function OrderTable({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = status === "all" || order.fulfillment_status === status;
    const searchable = [
      order.customers?.full_name,
      order.customers?.email,
      order.product_sku,
      order.id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101b3d] shadow-2xl shadow-black/10">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <PackageCheck size={19} className="text-[#B8863B]" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Customer orders</h2>
            </div>
            <p className="mt-1 text-sm text-white/45">
              {filteredOrders.length} of {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label className="relative block min-w-0 sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <span className="sr-only">Search orders</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer or product"
                className="h-10 w-full rounded-md border border-white/10 bg-[#0c1530] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#B8863B]/70"
              />
            </label>

            <label className="relative block sm:w-44">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <span className="sr-only">Filter orders by status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full appearance-none rounded-md border border-white/10 bg-[#0c1530] pl-9 pr-3 text-sm capitalize text-white outline-none focus:border-[#B8863B]/70"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All statuses" : option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Search size={22} className="mx-auto text-white/25" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-white/70">No matching orders</p>
          <p className="mt-1 text-sm text-white/40">Try a different customer, product, or status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 bg-white/[0.025]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Placed</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group transition-colors hover:bg-white/[0.035]">
                  <td className="px-6 py-4">
                    <div className="max-w-[230px]">
                      <p className="truncate text-sm font-semibold text-white">
                        {order.customers?.full_name || "Guest customer"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {order.customers?.email ? (
                      <a
                        href={`mailto:${order.customers.email}`}
                        title={order.customers.email}
                        className="inline-flex max-w-[220px] items-center gap-1.5 truncate text-sm text-[#d7b26b] transition-colors hover:text-white"
                      >
                        <Mail size={14} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{order.customers.email}</span>
                      </a>
                    ) : (
                      <span className="text-sm text-white/35">No email recorded</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[220px] truncate text-sm font-medium capitalize text-white/80">
                      {formatProductSku(order.product_sku)}
                    </p>
                    {formatAmount(order) && (
                      <p className="mt-1 text-xs text-white/40">{formatAmount(order)}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.fulfillment_status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-white/50">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#d7b26b] transition-colors hover:text-white"
                      >
                        View
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                      <ResendOrderButton orderId={order.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
