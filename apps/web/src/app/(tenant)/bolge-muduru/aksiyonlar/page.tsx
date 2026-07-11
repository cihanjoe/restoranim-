"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ActionItem {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  restaurant_name: string;
  restaurant_id: string;
  source_visit_answer_id: string | null;
  opened_at: string;
  repeat_count: number;
}

type ColumnKey = "open" | "pending_approval" | "approved" | "rejected";

const COLUMNS: { key: ColumnKey; label: string; badgeClass: string }[] = [
  { key: "open", label: "Açık", badgeClass: "bg-warning text-dark" },
  { key: "pending_approval", label: "Onay Bekleyen", badgeClass: "bg-info" },
  { key: "approved", label: "Onaylanan", badgeClass: "bg-success" },
  { key: "rejected", label: "Reddedilen", badgeClass: "bg-danger" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "open", label: "Açık" },
  { value: "pending_approval", label: "Onay Bekleyen" },
  { value: "approved", label: "Onaylanan" },
  { value: "rejected", label: "Reddedilen" },
];

export default function AksiyonlarPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  const fetchActions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setLoading(false); return; }

    const uid = session.user.id;

    // 1. Bölge müdürüne atanan restoran ID'lerini al
    const { data: managerData } = await supabase
      .from("restaurant_regional_managers")
      .select("restaurant_id")
      .eq("regional_manager_user_id", uid);

    const restaurantIds: string[] = (managerData ?? []).map(
      (r: { restaurant_id: string }) => r.restaurant_id
    );

    if (restaurantIds.length === 0) {
      setActions([]);
      setLoading(false);
      return;
    }

    // 2. Bu restoranların aksiyonlarını getir
    const { data } = await supabase
      .from("actions")
      .select("id, title, status, due_date, restaurant_id, source_visit_answer_id, opened_at, repeat_count, restaurants!inner(name)")
      .in("restaurant_id", restaurantIds)
      .order("opened_at", { ascending: false });

    setActions(
      (data ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        due_date: a.due_date,
        restaurant_name: a.restaurants?.name ?? "Bilinmeyen",
        restaurant_id: a.restaurant_id,
        source_visit_answer_id: a.source_visit_answer_id,
        opened_at: a.opened_at,
        repeat_count: a.repeat_count ?? 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const updateStatus = async (actionId: string, newStatus: string) => {
    const payload: any = { status: newStatus };
    if (newStatus === "approved") {
      payload.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("actions")
      .update(payload)
      .eq("id", actionId);

    if (error) {
      alert("Güncellenemedi: " + error.message);
      return;
    }

    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
    );
  };

  const deleteAction = async (actionId: string) => {
    if (!confirm("Bu aksiyonu silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase
      .from("actions")
      .delete()
      .eq("id", actionId);

    if (error) {
      alert("Silinemedi: " + error.message);
      return;
    }

    setActions((prev) => prev.filter((a) => a.id !== actionId));
    setShowModal(false);
  };

  const getActionsByColumn = (key: ColumnKey) =>
    actions.filter((a) => a.status === key);

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
          <h2 className="h5 fw-bold text-dark mb-1">Aksiyon Takip Panosu</h2>
          <p className="text-muted small mb-0">
            Ziyaretlerden oluşturulan aksiyon maddeleri
          </p>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="row g-3">
        {COLUMNS.map((col) => {
          const items = getActionsByColumn(col.key);
          return (
            <div className="col-lg-3 col-md-6" key={col.key}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-transparent border-bottom-0 pt-3 px-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className={`mb-0 fw-bold`}>
                      <span className={`badge ${col.badgeClass} me-2`}>{items.length}</span>
                      {col.label}
                    </h6>
                  </div>
                </div>
                <div className="card-body px-3 pt-0 pb-3">
                  {items.length === 0 ? (
                    <p className="text-muted small fst-italic text-center py-4 mb-0">
                      Henüz aksiyon yok
                    </p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-3 p-3 bg-white cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedAction(item);
                            setShowModal(true);
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 small fw-semibold">{item.title}</h6>
                          </div>
                          <p className="small text-muted mb-1">{item.restaurant_name}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {formatDate(item.due_date)}
                            </span>
                            {item.repeat_count > 0 && (
                              <span className="badge bg-secondary bg-opacity-10 text-secondary small">
                                x{item.repeat_count + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aksiyon Detay Modal */}
      {showModal && selectedAction && (
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
                <h5 className="modal-title fw-bold">Aksiyon Detayı</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="small text-muted d-block">Başlık</label>
                  <p className="fw-semibold mb-0">{selectedAction.title}</p>
                </div>
                <div className="mb-3">
                  <label className="small text-muted d-block">Restoran</label>
                  <p className="mb-0">{selectedAction.restaurant_name}</p>
                </div>
                <div className="mb-3">
                  <label className="small text-muted d-block">Termin</label>
                  <p className="mb-0">{formatDate(selectedAction.due_date)}</p>
                </div>
                <div className="mb-3">
                  <label className="small text-muted d-block">Oluşturulma</label>
                  <p className="mb-0">{formatDate(selectedAction.opened_at)}</p>
                </div>
                <div className="mb-3">
                  <label className="small text-muted d-block">Durum</label>
                  <select
                    className="form-select"
                    value={selectedAction.status}
                    onChange={(e) => {
                      updateStatus(selectedAction.id, e.target.value);
                      setSelectedAction({ ...selectedAction, status: e.target.value });
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAction.repeat_count > 0 && (
                  <div className="mb-3">
                    <label className="small text-muted d-block">Tekrar Sayısı</label>
                    <p className="mb-0">{selectedAction.repeat_count + 1}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => deleteAction(selectedAction.id)}
                >
                  Aksiyonu Sil
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}