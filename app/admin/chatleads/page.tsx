// app/admin/chat-leads/page.tsx

import { createClient } from "@/lib/supabase-server";

export default async function ChatLeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("chat_leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Chat Leads</h1>

      <div className="overflow-hidden rounded-xl bg-[#142050]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 font-mono text-xs tracking-widest text-white/50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Received</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-t border-white/10 align-top">
                <td className="p-4">{lead.name || "—"}</td>
                <td className="p-4">
                  <a href={`mailto:${lead.email}`} className="text-white/80 hover:text-white">
                    {lead.email}
                  </a>
                </td>
                <td className="p-4 text-white/70">{lead.phone || "—"}</td>
                <td className="p-4 text-white/60">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-white/50">
                  No chat leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
