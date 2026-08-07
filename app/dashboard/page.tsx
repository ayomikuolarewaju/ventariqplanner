// app/dashboard/page.tsx

import { createClient } from "@/lib/supabase-server";

const STEPS = ["pending", "preparing", "ready", "completed"];

const STEP_LABELS: Record<string, string> = {
  pending: "Order Received",
  preparing: "Preparing Your Plan",
  ready: "Guide Ready",
  completed: "Delivered",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = user
    ? await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const status = order?.fulfillment_status ?? "pending";
  const currentStep = Math.max(STEPS.indexOf(status), 0);

  return (
    <main className="container py-20">
      <p className="font-mono text-xs tracking-[0.3em] text-[#9DB2FF]">
        YOUR ACCOUNT
      </p>
      <h1 className="mt-4 font-display text-5xl tracking-wide">
        My Travel Plan
      </h1>

      {!order ? (
        <div className="mt-10 max-w-lg rounded-xl bg-[#142050] p-8">
          <p className="text-blue-200">
            No orders yet — once you purchase a plan, its status will
            show up here.
          </p>
          <a
            href="/world-cup"
            className="mt-5 inline-block rounded bg-[#E8002D] px-6 py-3 font-bold"
          >
            Browse Plans
          </a>
        </div>
      ) : (
        <div className="mt-10 max-w-xl rounded-xl bg-[#142050] p-8">
          <p className="font-mono text-xs tracking-widest text-[#F5B301]">
            {order.product_sku?.toUpperCase()}
          </p>

          <div className="mt-6 flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    i <= currentStep ? "bg-[#E8002D]" : "bg-white/20"
                  }`}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 ${
                      i < currentStep ? "bg-[#E8002D]" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <h2 className="mt-6 font-display text-3xl tracking-wide text-[#F5B301]">
            {STEP_LABELS[status] ?? status}
          </h2>

          <div className="relative my-7">
            <div
              aria-hidden
              className="absolute -left-3 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
            />
            <div
              aria-hidden
              className="absolute -right-3 top-0 h-5 w-5 -translate-y-1/2 rounded-full bg-[#0D1B4B]"
            />
            <div className="border-t border-dashed border-white/20" />
          </div>

          <p className="font-mono text-[10px] tracking-widest text-white/40">
            ORDER PLACED{" "}
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString()
              : "—"}
          </p>
        </div>
      )}
    </main>
  );
}
