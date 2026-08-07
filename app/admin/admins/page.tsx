// app/admin/admins/page.tsx

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import CreateAdminForm from "@/components/CreateAdminForm";

export default async function AdminAdminsPage() {
  const supabase = await createClient();

  const { data: adminRows } = await supabase.from("admins").select("user_id");
  const adminIds = new Set((adminRows ?? []).map((r) => r.user_id));

  // listing emails requires the service-role client — the regular
  // client can't read auth.users directly
  const adminClient = createAdminClient();
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const adminUsers = (usersData?.users ?? []).filter((u) => adminIds.has(u.id));

  return (
    <main className="container py-10">
      <h1 className="mb-8 text-4xl font-bold">Admins</h1>

      <div className="mb-10 overflow-hidden rounded-xl bg-[#142050]">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 font-mono text-xs tracking-widest text-white/50">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-t border-white/10">
                <td className="p-4">{u.email}</td>
                <td className="p-4 text-white/60">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {adminUsers.length === 0 && (
              <tr>
                <td colSpan={2} className="p-6 text-center text-white/50">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateAdminForm />
    </main>
  );
}
