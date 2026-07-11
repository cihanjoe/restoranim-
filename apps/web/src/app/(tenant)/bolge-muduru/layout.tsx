import { DashboardLayout } from "@/components/hope-ui/layout/DashboardLayout";

export default function BolgeMuduruLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="bolge-muduru" title="Genel Bakış" subtitle="Bölge Müdürü Paneli">
      {children}
    </DashboardLayout>
  );
}