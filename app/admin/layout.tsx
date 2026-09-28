import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1B4B] text-white">
      <AdminNav />
      {children}
    </div>
  );
}