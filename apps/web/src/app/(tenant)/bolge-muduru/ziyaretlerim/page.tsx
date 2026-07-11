"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  restaurant_name: string;
}

export default function ZiyaretlerimPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const uid = session.user.id;

    // Ziyaret listesi: odz_visits + restaurants JOIN
    const { data: visitData } = await supabase
      .from("odz_visits")
      .select("id, visit_date, status, restaurants!inner(name)")
      .eq("regional_manager_user_id", uid)
      .order("visit_date", { ascending: false });

    setVisits(
      (visitData ?? []).map((v: any) => ({
        id: v.id,
        visit_date: v.visit_date,
        status: v.status,
        restaurant_name: v.restaurants?.name ?? "Bilinmeyen",
      }))
    );

    // Kullanıcıya atanan restoranlar
    const { data: restData } = await supabase
      .from("restaurant_regional_managers")
      .select("restaurants!inner(id, name)")
      .eq("regional_manager_user_id", uid);

    const mapped = (restData ?? [])
      .map((r: any) => r.restaurants)
      .filter(Boolean)
      .map((r: any) => ({ id: r.id, name: r.name }));

    setRestaurants(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startNewVisit = async () => {
    if (!selectedRestaurant) return;
    setCreating(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("odz_visits")
      .insert([
        {
          restaurant_id: selectedRestaurant,
          regional_manager_user_id: session.user.id,
          visit_date: new Date().toISOString().slice(0, 10),
          status: "draft",
        },
      ])
      .select("id")
      .single();

    setCreating(false);
    if (error) {
      alert("Ziyaret oluşturulamadı: " + error.message);
      return;
    }

    setShowNewModal(false);
    // Wizard sayfasına yönlendir
    if (data) {
      window.location.href = `/bolge-muduru/ziyaret/${data.id}`;
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      draft: { label: "Taslak", cls: "bg-warning text-dark" },
      completed: { label: "Tamamlandı", cls: "bg-success" },
      notified: { label: "Bilgilendirildi", cls: "bg-info" },
    };
    const m = map[s] ?? { label: s, cls: "bg-secondary" };
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Ziyaretlerim</h2>
          <p className="text-muted small mb-0">Yaptığınız ODZ ziyaretleri</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowNewModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Ziyaret
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
          <h4 className="card-title mb-0">Ziyaret Geçmişi</h4>
        </div>
        <div className="card-body px-0">
          <div className="table-responsive px-4">
            <table className="table table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Restoran</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th style={{ minWidth: 100 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4 fst-italic">
                      Henüz ziyaret kaydı bulunmuyor
                    </td>
                  </tr>
                )}
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td className="fw-semibold text-dark">{v.restaurant_name}</td>
                    <td className="text-muted small">
                      {new Date(v.visit_date).toLocaleDateString("tr-TR")}
                    </td>
                    <td>{statusBadge(v.status)}</td>
                    <td>
                      <Link
                        href={`/bolge-muduru/ziyaret/${v.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        {v.status === "draft" ? "Devam Et" : "Görüntüle"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Yeni Ziyaret Modal */}
      {showNewModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Yeni Ziyaret Başlat</h5>
                <button type="button" className="btn-close" onClick={() => setShowNewModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Restoran Seçin</label>
                  <select
                    className="form-select"
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                  >
                    <option value="">-- Seçin --</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                {restaurants.length === 0 && (
                  <div className="alert alert-warning py-2 small">
                    Size atanmış restoran bulunamadı.
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedRestaurant || creating}
                  onClick={startNewVisit}
                >
                  {creating ? "Oluşturuluyor..." : "Başlat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}