"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiBriefcase,
  FiCreditCard,
  FiLifeBuoy,
  FiSettings,
  FiUsers,
  FiMapPin,
  FiClipboard,
  FiUserCheck,
  FiUser,
  FiFileText,
} from "react-icons/fi";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
};

const sidebarConfig: Record<string, SidebarItem[]> = {
  super_admin: [
    { label: "Genel Bakış", href: "/super-admin/hos-geldin", icon: FiGrid },
    { label: "Firmalar", href: "/super-admin/firmalar", icon: FiBriefcase },
    { label: "Abonelikler", href: "/super-admin/abonelikler", icon: FiCreditCard },
    { label: "Destek Talepleri", href: "/super-admin/destek-talepleri", icon: FiLifeBuoy },
    { label: "Ayarlar", href: "/super-admin/ayarlar", icon: FiSettings },
  ],
  firma_admin: [
    { label: "Genel Bakış", href: "/firma-admin/hos-geldin", icon: FiGrid },
    { label: "Restoranlar", href: "/firma-admin/restoranlar", icon: FiMapPin },
    { label: "Bölge Müdürleri", href: "/firma-admin/bolge-mudurleri", icon: FiUserCheck },
    { label: "ODZ Form Builder", href: "/firma-admin/form-builder", icon: FiFileText },
    { label: "Personel Alanları", href: "/firma-admin/personel-alanlari", icon: FiClipboard },
    { label: "Ayarlar", href: "/firma-admin/ayarlar", icon: FiSettings },
  ],
  bolge_muduru: [
    { label: "Genel Bakış", href: "/bolge-muduru/genel-bakis", icon: FiGrid },
    { label: "Restoranlarım", href: "/bolge-muduru/restoranlarim", icon: FiMapPin },
    { label: "Ziyaretlerim", href: "/bolge-muduru/ziyaretlerim", icon: FiUserCheck },
    { label: "Aksiyonlar", href: "/bolge-muduru/aksiyonlar", icon: FiClipboard },
  ],
  restoran_muduru: [
    { label: "Genel Bakış", href: "/restoran-muduru/genel-bakis", icon: FiGrid },
    { label: "Personelim", href: "/restoran-muduru/personel", icon: FiUsers },
    { label: "Ziyaret Geçmişi", href: "/restoran-muduru/ziyaret-gecmisi", icon: FiUserCheck },
    { label: "Aksiyonlarım", href: "/restoran-muduru/aksiyonlarim", icon: FiClipboard },
  ],
};

interface AppSidebarProps {
  role: string;
  userName?: string;
  userInitials?: string;
}

export function AppSidebar({ role, userName = "Kullanıcı", userInitials = "??" }: AppSidebarProps) {
  const pathname = usePathname();
  const items = sidebarConfig[role] ?? [];

  const roleLabels: Record<string, string> = {
    super_admin: "Süper Admin",
    firma_admin: "Firma Admin",
    bolge_muduru: "Bölge Müdürü",
    restoran_muduru: "Restoran Müdürü",
  };

  return (
    <aside className="d-none d-lg-flex flex-column bg-white border-end" style={{ width: 280 }}>
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
            style={{ width: 44, height: 44 }}
          >
            ODZ
          </div>
          <div>
            <div className="fw-semibold text-dark">ODZ Platform</div>
            <div className="small text-muted">{roleLabels[role] ?? role}</div>
          </div>
        </div>
      </div>

      <nav className="p-3">
        <div className="small text-uppercase text-muted fw-semibold mb-3">Ana Menü</div>
        <div className="d-flex flex-column gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${
                  isActive ? "bg-primary text-white" : "text-dark"
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto p-3 border-top">
        <Link
          className="d-flex align-items-center gap-3 text-decoration-none text-dark"
          href="/hesabim"
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-semibold"
            style={{ width: 42, height: 42 }}
          >
            {userInitials}
          </div>
          <div>
            <div className="fw-semibold small">{userName}</div>
            <div className="small text-muted">{roleLabels[role] ?? role}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}