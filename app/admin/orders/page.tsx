// app/admin/orders/page.tsx

import { createClient } from "@/lib/supabase-server";
import OrderTable from "@/components/OrderTable";

export default async function Orders() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers(
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Orders</h1>
      <OrderTable orders={orders || []} />
    </main>
  );
}
