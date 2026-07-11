"use client";

import { FiBell, FiSearch, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AppHeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
  userInitials?: string;
}

export function AppHeader({ title, subtitle, userName = "Kullanıcı", userInitials = "??" }: AppHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
  };

  return (
    <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
      <div>
        <div className="text-muted small">{subtitle}</div>
        <h1 className="h4 mb-0 fw-bold text-dark">{title}</h1>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2 bg-light">
          <FiSearch className="text-muted" size={16} />
          <span className="small text-muted">Ara</span>
        </div>

        <button
          aria-label="Bildirimler"
          className="btn btn-light rounded-circle position-relative"
          type="button"
        >
          <FiBell size={16} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </button>

        <div className="d-flex align-items-center gap-2">
          <div className="text-end">
            <div className="fw-semibold text-dark">{userName}</div>
            <div className="small text-muted">{subtitle}</div>
          </div>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-semibold"
            style={{ width: 42, height: 42 }}
          >
            {userInitials}
          </div>
        </div>

        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Çıkış Yap"
        >
          <FiLogOut size={16} />
          <span className="d-none d-md-inline">{loggingOut ? "Çıkılıyor..." : "Çıkış"}</span>
        </button>
      </div>
    </header>
  );
}