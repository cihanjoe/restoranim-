"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function GirisPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "E-posta veya şifre hatalı."
          : signInError.message);
        return;
      }

      if (!data.user) {
        setError("Kullanıcı bulunamadı.");
        return;
      }

      // Kullanıcının rolünü users tablosundan oku
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (userError || !userData) {
        setError("Kullanıcı rolü bulunamadı.");
        return;
      }

      const role = userData.role;

      // Role göre yönlendir
      const roleRoutes: Record<string, string> = {
        super_admin: "/super-admin/hos-geldin",
        firma_admin: "/firma-admin/hos-geldin",
        bolge_muduru: "/bolge-muduru/genel-bakis",
        restoran_muduru: "/restoran-muduru/genel-bakis",
      };

      const target = roleRoutes[role];
      if (target) {
        router.push(target);
        router.refresh();
      } else {
        setError(`Bilinmeyen rol: ${role}`);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 500, width: "100%" }}>
        <div className="row g-0">
          {/* Sol panel - gradient */}
          <div className="col-md-5 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-4"
            style={{
              background: "linear-gradient(135deg, #3a57e8 0%, #1aa053 100%)",
            }}
          >
            <div className="text-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary fw-bold mx-auto mb-3"
                style={{ width: 64, height: 64, fontSize: 24 }}
              >
                ODZ
              </div>
              <h3 className="fw-bold mb-2">ODZ Platform</h3>
              <p className="small opacity-75 mb-0">Restoran Denetim Sistemi</p>
            </div>
          </div>

          {/* Sağ panel - form */}
          <div className="col-md-7 p-4 p-lg-5">
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1">Hoş Geldiniz</h4>
              <p className="text-muted small mb-0">Hesabınıza giriş yapın</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">E-posta</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="ornek@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Şifre</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </button>

              <div className="text-center">
                <Link href="/sifremi-unuttum" className="text-muted small text-decoration-none">
                  Şifremi Unuttum
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}