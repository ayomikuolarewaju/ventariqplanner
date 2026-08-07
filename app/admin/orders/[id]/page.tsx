// app/admin/orders/[id]/page.tsx

import { createClient } from "@/lib/supabase-server";

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
    .single();

  if (!order) {
    return (
      <main className="container py-10">
        <h1 className="text-4xl font-bold">Order not found</h1>
        <p className="mt-4 text-blue-200">
          No order matches this ID. It may have been removed, or the link is
          incorrect.
        </p>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold">Order Details</h1>

      <div className="bg-[#142050] p-6 rounded-xl mt-8">
        <p>Customer: {order.customers?.full_name ?? "—"}</p>
        <p>Email: {order.customers?.email ?? "—"}</p>
        <p>Product: {order.product_sku}</p>
        <p>Status: {order.fulfillment_status}</p>

        <h2 className="text-2xl mt-6">Trip Information</h2>
        <pre className="mt-4 bg-black/20 p-4 rounded">
          {JSON.stringify(order.travel_intake, null, 2)}
        </pre>
      </div>
    </main>
  );
}
