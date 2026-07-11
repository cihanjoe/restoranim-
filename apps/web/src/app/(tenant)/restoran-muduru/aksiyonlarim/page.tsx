"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiEdit3, FiRefreshCw } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

interface ActionItem {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  restaurant_name: string;
  opened_at: string;
  approved_at: string | null;
  repeat_count: number;
}

interface RawAction {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  opened_at: string;
  approved_at: string | null;
  repeat_count: number | null;
  restaurants?: { name: string } | { name: string }[] | null;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  open: { label: "Açık", className: "bg-warning text-dark" },
  pending_approval: { label: "Onay Bekliyor", className: "bg-info" },
  approved: { label: "Onaylandı", className: "bg-success" },
  rejected: { label: "Reddedildi", className: "bg-danger" },
};

export default function RestoranMuduruAksiyonlarimPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setActions([]);
      setLoading(false);
      return;
    }

    const { data: restaurants, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("manager_user_id", session.user.id);

    if (restaurantError) {
      setMessage(`Restoran bilgisi alınamadı: ${restaurantError.message}`);
      setLoading(false);
      return;
    }

    const restaurantIds = (restaurants ?? []).map(
      (restaurant) => restaurant.id,
    );

    if (restaurantIds.length === 0) {
      setActions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("actions")
      .select(
        "id, title, status, due_date, opened_at, approved_at, repeat_count, restaurants!inner(name)",
      )
      .in("restaurant_id", restaurantIds)
      .order("opened_at", { ascending: false });

    if (error) {
      setMessage(`Aksiyonlar alınamadı: ${error.message}`);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as RawAction[];

    setActions(
      rows.map((action) => ({
        id: action.id,
        title: action.title,
        status: action.status,
        due_date: action.due_date,
        restaurant_name: Array.isArray(action.restaurants)
          ? (action.restaurants[0]?.name ?? "Bilinmeyen restoran")
          : (action.restaurants?.name ?? "Bilinmeyen restoran"),
        opened_at: action.opened_at,
        approved_at: action.approved_at,
        repeat_count: action.repeat_count ?? 0,
      })),
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const submitForApproval = async () => {
    if (!selectedAction) return;
    if (!description.trim()) {
      setMessage("Onaya göndermek için kısa bir açıklama yazın.");
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error: updateError } = await supabase
      .from("actions")
      .update({ status: "pending_approval" })
      .eq("id", selectedAction.id);

    if (updateError) {
      setMessage(`Aksiyon güncellenemedi: ${updateError.message}`);
      setSaving(false);
      return;
    }

    const { error: logError } = await supabase.from("action_updates").insert({
      action_id: selectedAction.id,
      created_by_user_id: session?.user.id,
      description: description.trim(),
      review_status: "pending",
    });

    if (logError) {
      setMessage(`Aksiyon kaydı oluşturulamadı: ${logError.message}`);
      setSaving(false);
      return;
    }

    setMessage("Aksiyon onaya gönderildi.");
    setDescription("");
    setSelectedAction(null);
    setSaving(false);
    fetchActions();
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const groupedActions = {
    open: actions.filter((action) => action.status === "open"),
    pending_approval: actions.filter(
      (action) => action.status === "pending_approval",
    ),
    rejected: actions.filter((action) => action.status === "rejected"),
    approved: actions.filter((action) => action.status === "approved"),
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <output className="spinner-border text-primary">
          <span className="visually-hidden">Yükleniyor...</span>
        </output>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Aksiyonlarım</h2>
          <p className="text-muted small mb-0">
            Restoranınıza atanmış aksiyonları takip edin ve tamamlananları onaya
            gönderin.
          </p>
        </div>
        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          onClick={fetchActions}
          type="button"
        >
          <FiRefreshCw size={16} />
          Yenile
        </button>
      </div>

      {message && (
        <div
          className={`alert ${message.includes("gönderildi") ? "alert-success" : "alert-danger"} py-2 small`}
        >
          {message}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Açık</div>
              <div className="h4 fw-bold mb-0">
                {groupedActions.open.length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Onay Bekleyen</div>
              <div className="h4 fw-bold mb-0">
                {groupedActions.pending_approval.length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Reddedilen</div>
              <div className="h4 fw-bold mb-0">
                {groupedActions.rejected.length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="text-muted small">Onaylanan</div>
              <div className="h4 fw-bold mb-0">
                {groupedActions.approved.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr>
                <th>Aksiyon</th>
                <th>Restoran</th>
                <th>Termin</th>
                <th>Durum</th>
                <th>Oluşturulma</th>
                <th style={{ width: 150 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {actions.length === 0 ? (
                <tr>
                  <td className="text-center text-muted py-5" colSpan={6}>
                    Restoranınıza atanmış aksiyon bulunmuyor.
                  </td>
                </tr>
              ) : (
                actions.map((action) => {
                  const status = STATUS_META[action.status] ?? STATUS_META.open;
                  const canSubmit =
                    action.status === "open" || action.status === "rejected";

                  return (
                    <tr key={action.id}>
                      <td>
                        <div className="fw-semibold text-dark">
                          {action.title}
                        </div>
                        {action.repeat_count > 1 && (
                          <div className="small text-muted">
                            Tekrar: {action.repeat_count}
                          </div>
                        )}
                      </td>
                      <td className="small text-muted">
                        {action.restaurant_name}
                      </td>
                      <td className="small">{formatDate(action.due_date)}</td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {formatDate(action.opened_at)}
                      </td>
                      <td>
                        {canSubmit ? (
                          <button
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                            onClick={() => {
                              setSelectedAction(action);
                              setDescription("");
                              setMessage("");
                            }}
                            type="button"
                          >
                            <FiEdit3 size={14} />
                            Onaya Gönder
                          </button>
                        ) : action.status === "approved" ? (
                          <span className="text-success small d-inline-flex align-items-center gap-1">
                            <FiCheckCircle size={14} />
                            Tamam
                          </span>
                        ) : (
                          <span className="text-muted small d-inline-flex align-items-center gap-1">
                            <FiClock size={14} />
                            Bekliyor
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAction && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Aksiyonu Onaya Gönder</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAction(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="small text-muted">Aksiyon</div>
                  <p className="fw-semibold mb-0">{selectedAction.title}</p>
                </div>
                <div className="mb-3">
                  <label
                    className="form-label small text-muted"
                    htmlFor="action_description"
                  >
                    Tamamlama Açıklaması *
                  </label>
                  <textarea
                    className="form-control"
                    id="action_description"
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Yapılan düzeltmeyi kısaca açıklayın"
                  />
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedAction(null)}
                  type="button"
                >
                  İptal
                </button>
                <button
                  className="btn btn-primary"
                  onClick={submitForApproval}
                  disabled={saving}
                  type="button"
                >
                  {saving ? "Gönderiliyor..." : "Onaya Gönder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
