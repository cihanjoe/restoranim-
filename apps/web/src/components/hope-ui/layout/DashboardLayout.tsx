"use client";

import { AppSidebar } from "@/components/hope-ui/layout/AppSidebar";
import { AppHeader } from "@/components/hope-ui/layout/AppHeader";
import { useUser } from "@/lib/hooks/useUser";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  title: string;
  subtitle: string;
}

const roleMap: Record<string, string> = {
  "super-admin": "super_admin",
  "firma-admin": "firma_admin",
  "bolge-muduru": "bolge_muduru",
  "restoran-muduru": "restoran_muduru",
};

export function DashboardLayout({ children, role, title, subtitle }: DashboardLayoutProps) {
  const { user, loading } = useUser();
  const roleKey = roleMap[role] ?? "super_admin";

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <AppSidebar
        role={roleKey}
        userName={user?.full_name ?? "Kullanıcı"}
        userInitials={getInitials(user?.full_name ?? "")}
      />
      <div className="flex-grow-1 d-flex flex-column">
        <AppHeader
          title={title}
          subtitle={subtitle}
          userName={user?.full_name ?? "Kullanıcı"}
          userInitials={getInitials(user?.full_name ?? "")}
        />
        <main className="p-4 p-lg-5">{children}</main>
      </div>
    </div>
  );
}