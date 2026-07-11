"use client";

import { AppSidebar } from "@/components/hope-ui/layout/AppSidebar";
import { AppHeader } from "@/components/hope-ui/layout/AppHeader";
import { useUser } from "@/lib/hooks/useUser";
import { useParams } from "next/navigation";

const roleTitles: Record<string, { title: string; subtitle: string }> = {
  "super-admin": { title: "Genel Bakış", subtitle: "Süper Admin Paneli" },
  "firma-admin": { title: "Genel Bakış", subtitle: "Firma Admin Paneli" },
  "bolge-muduru": { title: "Genel Bakış", subtitle: "Bölge Müdürü Paneli" },
  "restoran-muduru": { title: "Genel Bakış", subtitle: "Restoran Müdürü Paneli" },
};

const roleMap: Record<string, string> = {
  "super-admin": "super_admin",
  "firma-admin": "firma_admin",
  "bolge-muduru": "bolge_muduru",
  "restoran-muduru": "restoran_muduru",
};

export default function RoleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const role = params?.role as string;
  const { user, loading } = useUser();
  const roleKey = roleMap[role] ?? "super_admin";
  const labels = roleTitles[role] ?? { title: "Panel", subtitle: "Yönetim Paneli" };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      <AppSidebar
        role={roleKey}
        userName={user?.full_name ?? "Kullanıcı"}
        userInitials={
          user?.full_name
            ? user.full_name.split(" ").length >= 2
              ? (user.full_name.split(" ")[0][0] + user.full_name.split(" ")[1][0]).toUpperCase()
              : user.full_name.substring(0, 2).toUpperCase()
            : "??"
        }
      />
      <div className="flex-grow-1 d-flex flex-column">
        <AppHeader
          title={labels.title}
          subtitle={labels.subtitle}
          userName={user?.full_name ?? "Kullanıcı"}
          userInitials={
            user?.full_name
              ? user.full_name.split(" ").length >= 2
                ? (user.full_name.split(" ")[0][0] + user.full_name.split(" ")[1][0]).toUpperCase()
                : user.full_name.substring(0, 2).toUpperCase()
              : "??"
          }
        />
        <main className="p-4 p-lg-5">{children}</main>
      </div>
    </div>
  );
}