import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 pb-16 md:pb-0">
      <h1 className="mb-4 md:mb-2 text-2xl md:text-3xl font-bold">Admin</h1>
      <AdminNav />
      {children}
    </div>
  );
}