import { DashboardLayout } from "@/components/hope-ui/layout/DashboardLayout";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="super-admin" title="Genel Bakış" subtitle="Süper Admin Paneli">
      {children}
    </DashboardLayout>
  );
}