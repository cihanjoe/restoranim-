"use client";

import { DashboardLayout } from "@/components/hope-ui/layout/DashboardLayout";

export default function FirmaAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="firma-admin" title="Genel Bakış" subtitle="Firma Admin Paneli">
      {children}
    </DashboardLayout>
  );
}