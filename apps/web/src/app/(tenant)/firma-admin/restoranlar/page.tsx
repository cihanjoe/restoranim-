"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { createRestoran, updateRestoran } from "@/lib/actions/restoran-actions";
import Link from "next/link";
import { FiPlus, FiEdit2, FiPhone } from "react-icons/fi";

const ILER = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya",
  "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Samsun",
  "Denizli", "Şanlıurfa", "Malatya", "Trabzon", "Manisa", "Kocaeli",
];

interface Restaurant {
  id: string;
  name: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  franchise?: boolean;
  opening_date?: string;
  manager_name?: string;
  manager_user_id?: string;
  status: string;
  google_score?: number | null;
  yemeksepeti_score?: number | null;
  getir_score?: number | null;
  trendyol_yemek_score?: number | null;
  franchise_owner?: string | null;
  franchise_owner_phone?: string | null;
  franchise_owner_email?: string | null;
  invoice_address?: string | null;
}

interface RestaurantForm {
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  franchise: boolean;
  opening_date: string;
  manager_name: string;
  manager_user_id: string;
  status: string;
  google_score: string;
  yemeksepeti_score: string;
  getir_score: string;
  trendyol_yemek_score: string;
  franchise_owner: string;
  franchise_owner_phone: string;
  franchise_owner_email: string;
  invoice_address: string;
  selected_regional_managers: string[];
}

interface BolgeMudur {
  id: string;
  full_name: string;
}

const defaultForm: RestaurantForm = {
  name: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  email: "",
  franchise: false,
  opening_date: "",
  manager_name: "",
  manager_user_id: "",
  status: "active",
  google_score: "",
  yemeksepeti_score: "",
  getir_score: "",
  trendyol_yemek_score: "",
  franchise_owner: "",
  franchise_owner_phone: "",
  franchise_owner_email: "",
  invoice_address: "",
  selected_regional_managers: [],
};

export default function RestoranlarPage() {
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [bolgeMudurleri, setBolgeMudurleri] = useState<BolgeMudur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<RestaurantForm>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("tenant_id", user?.tenant_id);
    if (error) {
      setMessage("Hata: " + error.message);
    } else if (data) {
      setRestaurants(data as Restaurant[]);
    }
    setLoading(false);
  };

  const fetchBolgeMudurleri = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "bolge_muduru")
      .eq("tenant_id", user?.tenant_id);
    if (!error && data) {
      setBolgeMudurleri(data as unknown as BolgeMudur[]);
    }
  };

  const openAdd = () => {
    setEditRestaurant(null);
    setForm({ ...defaultForm });
    setMessage("");
    setShowModal(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditRestaurant(r);
    setForm({
      name: r.name,
      city: r.city ?? "",
      district: r.district ?? "",
      address: r.address ?? "",
      phone: r.phone ?? "",
      email: r.email ?? "",
      franchise: r.franchise ?? false,
      opening_date: r.opening_date ?? "",
      manager_name: r.manager_name ?? "",
      manager_user_id: r.manager_user_id ?? "",
      status: r.status,
      google_score: r.google_score?.toString() ?? "0",
      yemeksepeti_score: r.yemeksepeti_score?.toString() ?? "0",
      getir_score: r.getir_score?.toString() ?? "0",
      trendyol_yemek_score: r.trendyol_yemek_score?.toString() ?? "0",
      franchise_owner: r.franchise_owner ?? "",
      franchise_owner_phone: r.franchise_owner_phone ?? "",
      franchise_owner_email: r.franchise_owner_email ?? "",
      invoice_address: r.invoice_address ?? "",
      selected_regional_managers: [],
    });
    setMessage("");
    setShowModal(true);
  };

  // Fetch data when user is ready; stop loading if auth resolves without tenant
  useEffect(() => {
    if (!userLoading) {
      if (user?.tenant_id) {
        fetchRestaurants();
        fetchBolgeMudurleri();
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading]);

  const handleFormChange = (field: keyof RestaurantForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setMessage("Restoran adı zorunlu");
      return;
    }
    setSaving(true);
    setMessage("");
    const restoranData = {
      name: form.name,
      city: form.city || null,
      district: form.district || null,
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
      franchise: form.franchise,
      opening_date: form.opening_date || null,
      manager_name: form.manager_name || null,
      manager_user_id: form.manager_user_id || null,
      status: form.status,
      google_score: Number(form.google_score) || 0,
      yemeksepeti_score: Number(form.yemeksepeti_score) || 0,
      getir_score: Number(form.getir_score) || 0,
      trendyol_yemek_score: Number(form.trendyol_yemek_score) || 0,
      franchise_owner: form.franchise_owner || null,
      franchise_owner_phone: form.franchise_owner_phone || null,
      franchise_owner_email: form.franchise_owner_email || null,
      invoice_address: form.invoice_address || null,
    };
    const selectedRegionalManagers = form.selected_regional_managers.filter(
      (id) => id && id !== "undefined"
    );
    const result = editRestaurant
      ? await updateRestoran(editRestaurant.id, restoranData, selectedRegionalManagers)
      : await createRestoran(restoranData, selectedRegionalManagers);
    if (result?.error) {
      setMessage("Hata: " + result.error);
    } else {
      setMessage(editRestaurant ? "Restoran güncellendi ✅" : "Restoran eklendi ✅");
      fetchRestaurants();
    }
    setSaving(false);
    setShowModal(false);
  };

  const formatScore = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return val.toFixed(1);
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Restoranlar</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <FiPlus size={16} />
          Restoran Ekle
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-danger"} py-2 small`}>
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted">
              <tr>
                <th>Restoran</th>
                <th>Lokasyon</th>
                <th>İletişim</th>
                <th>Puanlar</th>
                <th>Durum</th>
                <th style={{ width: 80 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    Henüz restoran eklenmemiş. "Restoran Ekle" butonuna tıklayın.
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/firma-admin/restoranlar/${r.id}`} className="text-decoration-none fw-semibold text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold" style={{ width: 36, height: 36 }}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{r.name}</div>
                            {r.franchise && (
                              <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: 11 }}>
                                Franchise
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div className="small">
                        {r.city && <div>{r.city}{r.district ? ` / ${r.district}` : ""}</div>}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {r.phone && <div><FiPhone size={12} className="me-1" />{r.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <div className="small d-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                        {r.google_score != null && (
                          <span className="badge bg-warning bg-opacity-10 text-warning">G: {formatScore(r.google_score)}</span>
                        )}
                        {r.yemeksepeti_score != null && (
                          <span className="badge bg-danger bg-opacity-10 text-danger">YS: {formatScore(r.yemeksepeti_score)}</span>
                        )}
                        {r.getir_score != null && (
                          <span className="badge bg-success bg-opacity-10 text-success">G: {formatScore(r.getir_score)}</span>
                        )}
                        {r.trendyol_yemek_score != null && (
                          <span className="badge bg-primary bg-opacity-10 text-primary">TY: {formatScore(r.trendyol_yemek_score)}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {r.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={() => openEdit(r)}>
                        <FiEdit2 size={14} />
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editRestaurant ? "Restoran Düzenle" : "Yeni Restoran Ekle"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="fw-bold text-primary mb-3">Temel Bilgiler</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted">Restoran Adı *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Restoran adı"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">İl</label>
                    <select
                      className="form-select"
                      value={form.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                    >
                      <option value="">Seçiniz</option>
                      {ILER.map((il) => (
                        <option key={il} value={il}>{il}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">İlçe</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.district}
                      onChange={(e) => handleFormChange("district", e.target.value)}
                      placeholder="İlçe"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Açılış Tarihi</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.opening_date}
                      onChange={(e) => handleFormChange("opening_date", e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Tür</label>
                    <select
                      className="form-select"
                      value={form.franchise ? "franchise" : "merkez"}
                      onChange={(e) => handleFormChange("franchise", e.target.value === "franchise")}
                    >
                      <option value="merkez">Merkeze Bağlı</option>
                      <option value="franchise">Franchise</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Durum</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => handleFormChange("status", e.target.value)}
                    >
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-muted">Adres</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.address}
                      onChange={(e) => handleFormChange("address", e.target.value)}
                      placeholder="Restoran adresi"
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="fw-bold text-primary mb-3">İletişim</h6>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted">Restoran Telefon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      placeholder="5XX XXX XX XX"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="restoran@ornek.com"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted">Fatura Adresi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invoice_address}
                      onChange={(e) => handleFormChange("invoice_address", e.target.value)}
                      placeholder="Fatura adresi"
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="fw-bold text-primary mb-3">Bölge Müdürü Atama</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted">Bölge Müdürleri</label>
                    <div className="border rounded-3 p-3" style={{ maxHeight: 180, overflowY: "auto" }}>
                      {bolgeMudurleri.length === 0 ? (
                        <div className="small text-muted">Henüz bölge müdürü eklenmemiş.</div>
                      ) : (
                        bolgeMudurleri.map((bm) => (
                          <div className="form-check" key={bm.id}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`bm-${bm.id}`}
                              checked={form.selected_regional_managers.includes(bm.id)}
                              onChange={() => {
                                const updated = form.selected_regional_managers.includes(bm.id)
                                  ? form.selected_regional_managers.filter((id) => id !== bm.id)
                                  : [...form.selected_regional_managers, bm.id];
                                handleFormChange("selected_regional_managers", updated);
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`bm-${bm.id}`}>
                              {bm.full_name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted">Restoran Müdürü</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.manager_name}
                      onChange={(e) => handleFormChange("manager_name", e.target.value)}
                      placeholder="Restoran müdürü adı"
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="fw-bold text-primary mb-3">Platform Puanları (0-5)</h6>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted">Google Puanı</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.google_score}
                      onChange={(e) => handleFormChange("google_score", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">Yemek Sepeti Puanı</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.yemeksepeti_score}
                      onChange={(e) => handleFormChange("yemeksepeti_score", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">Getir Puanı</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.getir_score}
                      onChange={(e) => handleFormChange("getir_score", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-muted">Trendyol Yemek Puanı</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.trendyol_yemek_score}
                      onChange={(e) => handleFormChange("trendyol_yemek_score", e.target.value)}
                    />
                  </div>

                  {form.franchise && (
                    <>
                      <div className="col-12 mt-4">
                        <h6 className="fw-bold text-primary mb-3">Franchise Bilgileri</h6>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted">Restoran Sahibi</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.franchise_owner}
                          onChange={(e) => handleFormChange("franchise_owner", e.target.value)}
                          placeholder="Sahip adı"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">Sahip İletişim No</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.franchise_owner_phone}
                          onChange={(e) => handleFormChange("franchise_owner_phone", e.target.value)}
                          placeholder="5XX XXX XX XX"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">Sahip E-posta</label>
                        <input
                          type="email"
                          className="form-control"
                          value={form.franchise_owner_email}
                          onChange={(e) => handleFormChange("franchise_owner_email", e.target.value)}
                          placeholder="sahip@ornek.com"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {message && (
                  <div className={`small me-auto ${message.includes("✅") ? "text-success" : "text-danger"}`}>
                    {message}
                  </div>
                )}
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Kaydediliyor..." : editRestaurant ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}