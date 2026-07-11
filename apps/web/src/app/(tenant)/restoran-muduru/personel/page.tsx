"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StaffMember {
  id: string;
  full_name: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export default function PersonelPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    start_date: "",
    status: "active",
  });

  const supabase = createClient();

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }
    const uid = session.user.id;

    // Kullanıcının restoranını bul
    const { data: restData } = await supabase
      .from("restaurants")
      .select("id")
      .eq("manager_user_id", uid)
      .single();

    if (!restData) {
      setLoading(false);
      return;
    }

    setRestaurantId(restData.id);

    // Personel listesi
    const { data: staffData } = await supabase
      .from("staff_members")
      .select("id, full_name, position, start_date, end_date, status")
      .eq("restaurant_id", restData.id)
      .order("full_name", { ascending: true });

    setStaff(staffData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditMember(null);
    setForm({ full_name: "", position: "", start_date: "", status: "active" });
    setShowModal(true);
  };

  const openEdit = (m: StaffMember) => {
    setEditMember(m);
    setForm({
      full_name: m.full_name,
      position: m.position,
      start_date: m.start_date ?? "",
      status: m.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    const payload = {
      restaurant_id: restaurantId,
      full_name: form.full_name,
      position: form.position,
      start_date: form.start_date || null,
      status: form.status,
    };

    if (editMember) {
      await supabase.from("staff_members").update(payload).eq("id", editMember.id);
    } else {
      await supabase.from("staff_members").insert([payload]);
    }

    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    await supabase.from("staff_members").delete().eq("id", id);
    fetchData();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: "Aktif", cls: "bg-success" },
      passive: { label: "Pasif", cls: "bg-secondary" },
    };
    const m = map[s] ?? { label: s, cls: "bg-info" };
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };

  const initialLetters = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-5 text-center">
          <p className="text-muted mb-0">
            Size atanmış bir restoran bulunamadı.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sayfa Başlığı */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Personelim</h2>
          <p className="text-muted small mb-0">Restoranınızdaki personel listesi</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Personel Ekle
        </button>
      </div>

      {/* Tablo */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
          <h4 className="card-title mb-0">Personel Listesi</h4>
        </div>
        <div className="card-body px-0">
          <div className="table-responsive px-4">
            <table className="table table-striped align-middle mb-0" role="grid">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 40 }}></th>
                  <th>Ad Soyad</th>
                  <th>Pozisyon</th>
                  <th>Başlangıç</th>
                  <th>Durum</th>
                  <th style={{ minWidth: 100 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4 fst-italic">
                      Henüz personel kaydı bulunmuyor
                    </td>
                  </tr>
                )}
                {staff.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 bg-soft-primary text-primary fw-bold"
                        style={{ width: 38, height: 38, fontSize: 13 }}
                      >
                        {initialLetters(m.full_name)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{m.full_name}</td>
                    <td className="text-muted">{m.position}</td>
                    <td className="text-muted small">
                      {m.start_date
                        ? new Date(m.start_date).toLocaleDateString("tr-TR")
                        : "-"}
                    </td>
                    <td>{statusBadge(m.status)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-icon btn-warning"
                          title="Düzenle"
                          onClick={() => openEdit(m)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-sm btn-icon btn-danger"
                          title="Sil"
                          onClick={() => handleDelete(m.id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ekle/Düzenle Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  {editMember ? "Personel Düzenle" : "Yeni Personel Ekle"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Ad Soyad</label>
                    <input
                      className="form-control"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Pozisyon</label>
                    <input
                      className="form-control"
                      placeholder="Örn: Aşçıbaşı"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Durum</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMember ? "Kaydet" : "Ekle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}