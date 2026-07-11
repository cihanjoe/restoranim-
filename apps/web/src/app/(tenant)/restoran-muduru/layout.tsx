import { DashboardLayout } from "@/components/hope-ui/layout/DashboardLayout";

export default function RestoranMuduruLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="restoran-muduru" title="Genel Bakış" subtitle="Restoran Müdürü Paneli">
      {children}
    </DashboardLayout>
  );
}