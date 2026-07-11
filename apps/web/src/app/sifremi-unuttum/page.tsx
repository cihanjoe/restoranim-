"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/davet-kabul` }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

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

              {sent ? (
                <>
                  <div className="text-center py-4">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mx-auto mb-3"
                      style={{ width: 72, height: 72 }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#198754" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                    </div>
                    <h4 className="fw-bold mb-2">E-posta Gönderildi</h4>
                    <p className="text-muted mb-4">
                      Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                      Lütfen gelen kutunuzu kontrol edin.
                    </p>
                    <Link href="/giris" className="btn btn-primary">
                      Giriş Sayfasına Dön
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mb-2 fw-bold">Şifremi Unuttum</h2>
                  <p className="text-muted mb-4">
                    E-posta adresinizi girin, size şifre sıfırlama talimatlarını gönderelim.
                  </p>

                  {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleReset}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-semibold">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="ornek@firma.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      ) : null}
                      {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                    </button>
                  </form>

                  <p className="mt-4 text-center mb-0">
                    <Link href="/giris" className="text-primary text-decoration-none">
                      ← Giriş Sayfasına Dön
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="sign-bg sign-bg-right">
            <svg width="280" height="230" viewBox="0 0 431 398" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.05">
                <rect x="-157.085" y="193.773" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 -157.085 193.773)" fill="#3A57E8" />
                <rect x="7.46875" y="358.327" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 7.46875 358.327)" fill="#3A57E8" />
                <rect x="61.9355" y="138.545" width="310.286" height="77.5714" rx="38.7857" transform="rotate(45 61.9355 138.545)" fill="#3A57E8" />
                <rect x="62.3154" y="-190.173" width="543" height="77.5714" rx="38.7857" transform="rotate(45 62.3154 -190.173)" fill="#3A57E8" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}