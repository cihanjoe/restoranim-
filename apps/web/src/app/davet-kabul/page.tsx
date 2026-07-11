"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DavetKabulPage() {
  const router = useRouter();
  const [step, setStep] = useState<"loading" | "form" | "success" | "error">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [isInvite, setIsInvite] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      // 1) URL'deki hash'te recovery token varsa handle et
      const hash = window.location.hash;
      if (hash && hash.includes("type=recovery")) {
        // Supabase Auth otomatik olarak session'ı recovery mode'a alır
        setIsInvite(false);
        setStep("form");
        return;
      }

      // 2) Mevcut oturum var mı (invite akışı)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsInvite(true);
        // users tablosunda full_name varsa getir
        const { data: userData } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        if (userData?.full_name) {
          setFullName(userData.full_name);
        }
        setStep("form");
        return;
      }

      // 3) Ne recovery ne de oturum varsa -> giriş sayfasına yönlendir
      setStep("error");
    }

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Kullanıcı adını da güncelle (invite akışında)
    if (fullName) {
      await supabase.from("users").update({ full_name: fullName }).eq("id", (await supabase.auth.getSession()).data.session?.user.id);
    }

    setStep("success");
  };

  if (step === "loading") {
    return (
      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100 justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Kontrol ediliyor...</span>
          </div>
        </div>
      </section>
    );
  }

  if (step === "error") {
    return (
      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100 justify-content-center">
          <div className="col-md-6 p-5 text-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mx-auto mb-3"
              style={{ width: 72, height: 72 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h4 className="fw-bold mb-2">Geçersiz Bağlantı</h4>
            <p className="text-muted mb-4">
              Bu bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar giriş yapmayı deneyin.
            </p>
            <Link href="/giris" className="btn btn-primary">
              Giriş Sayfasına Git
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (step === "success") {
    return (
      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100 justify-content-center">
          <div className="col-md-6 p-5 text-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mx-auto mb-3"
              style={{ width: 72, height: 72 }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#198754" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4 className="fw-bold mb-2">
              {isInvite ? "Kaydınız Tamamlandı" : "Şifreniz Sıfırlandı"}
            </h4>
            <p className="text-muted mb-4">
              {isInvite
                ? "Artık giriş yapabilir ve panelinizi kullanmaya başlayabilirsiniz."
                : "Yeni şifreniz ile giriş yapabilirsiniz."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/")}
            >
              Paneli Aç
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="login-content">
      <div className="row m-0 align-items-center bg-white vh-100">
        <div className="col-md-6 d-md-block d-none bg-primary p-0 mt-n1 vh-100 overflow-hidden">
          <div
            className="h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "linear-gradient(135deg, #3A57E8 0%, #6f42c1 100%)",
            }}
          >
            <div className="text-center text-white p-5">
              <svg width="80" height="80" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="white" />
                <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="white" />
                <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="white" />
                <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="white" />
              </svg>
              <h3 className="text-white mt-3 fw-bold">ODZ Platform</h3>
              <p className="text-white-50">Restoran Denetim Sistemi</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 p-0">
          <div className="card card-transparent auth-card shadow-none d-flex justify-content-center mb-0 border-0">
            <div className="card-body p-5">
              <Link href="/giris" className="navbar-brand d-flex align-items-center mb-4">
                <svg width="30" className="text-primary" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="#3A57E8" />
                  <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="#3A57E8" />
                  <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="#3A57E8" />
                  <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="#3A57E8" />
                </svg>
                <h4 className="logo-title ms-3 fw-bold">ODZ Platform</h4>
              </Link>

              <h2 className="mb-2 fw-bold">
                {isInvite ? "Hoş Geldiniz" : "Şifre Sıfırlama"}
              </h2>
              <p className="text-muted mb-4">
                {isInvite
                  ? "Hesabınız oluşturuldu. Lütfen şifrenizi belirleyin."
                  : "Yeni şifrenizi belirleyin."}
              </p>

              {fullName && (
                <div className="alert alert-info py-2 small" role="alert">
                  Hoş geldiniz, <strong>{fullName}</strong>!
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="form-label fw-semibold">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirm-password"
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  {isInvite ? "Hesabımı Aktifleştir" : "Şifremi Sıfırla"}
                </button>
              </form>

              <p className="mt-4 text-center mb-0">
                <Link href="/giris" className="text-primary text-decoration-none">
                  ← Giriş Sayfasına Dön
                </Link>
              </p>
            </div>
          </div>
          <div className="sign-bg sign-bg-right">
            <svg width="280" height="230" viewBox="0 0 421 359" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.05">
                <rect x="-15.0845" y="154.773" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 -15.0845 154.773)" fill="#3A57E8" />
                <rect x="149.47" y="319.328" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 149.47 319.328)" fill="#3A57E8" />
                <rect x="203.936" y="99.543" width="310.286" height="77.5714" rx="38.7857" transform="rotate(45 203.936 99.543)" fill="#3A57E8" />
                <rect x="204.316" y="-229.172" width="543" height="77.5714" rx="38.7857" transform="rotate(45 204.316 -229.172)" fill="#3A57E8" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}