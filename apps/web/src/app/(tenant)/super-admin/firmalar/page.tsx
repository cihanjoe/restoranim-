"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createTenantWithAdmin, updateTenant, deleteTenant } from "@/lib/actions/firma-actions";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

export default function FirmalarPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    status: "active",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  // Admin kullanıcı alanları (sadece ekleme modunda)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");

  const supabase = createClient();

  const fetchTenants = useCallback(async () => {
    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, subdomain, status, contact_name, contact_email, contact_phone, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTenants(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const resetForm = () => {
    setForm({
      name: "",
      subdomain: "",
      status: "active",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
    });
    setAdminEmail("");
    setAdminPassword("");
    setAdminName("");
    setModalError("");
  };

  const openAdd = () => {
    setEditTenant(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (t: Tenant) => {
    setEditTenant(t);
    setForm({
      name: t.name,
      subdomain: t.subdomain,
      status: t.status,
      contact_name: t.contact_name ?? "",
      contact_email: t.contact_email ?? "",
      contact_phone: t.contact_phone ?? "",
    });
    setAdminEmail("");
    setAdminPassword("");
    setAdminName("");
    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      if (editTenant) {
        // Düzenleme — Server Action
        const fd = new FormData();
        fd.set("name", form.name);
        fd.set("subdomain", form.subdomain);
        fd.set("status", form.status);
        fd.set("contact_name", form.contact_name);
        fd.set("contact_email", form.contact_email);
        fd.set("contact_phone", form.contact_phone);

        const result = await updateTenant(editTenant.id, fd);
        if (result.error) {
          setModalError(result.error);
          return;
        }
      } else {
        // Yeni firma — Server Action (service_role key ile çalışır)
        if (!adminEmail || !adminPassword || !adminName) {
          setModalError("Admin kullanıcı bilgileri (e-posta, şifre, ad soyad) zorunludur.");
          return;
        }
        if (adminPassword.length < 6) {
          setModalError("Şifre en az 6 karakter olmalıdır.");
          return;
        }

        const fd = new FormData();
        fd.set("name", form.name);
        fd.set("subdomain", form.subdomain);
        fd.set("status", form.status);
        fd.set("contact_name", form.contact_name);
        fd.set("contact_email", form.contact_email);
        fd.set("contact_phone", form.contact_phone);
        fd.set("admin_email", adminEmail);
        fd.set("admin_password", adminPassword);
        fd.set("admin_name", adminName);

        const result = await createTenantWithAdmin(fd);
        if (result.error) {
          setModalError(result.error);
          return;
        }
      }

      setShowModal(false);
      fetchTenants();
    } catch (err: any) {
      setModalError(`Beklenmeyen hata: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu firmayı silmek istediğinize emin misiniz? Tüm kullanıcıları da silinecektir.")) return;

    const result = await deleteTenant(id);
    if (result.error) {
      setModalError(result.error);
      return;
    }
    fetchTenants();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: "Aktif", cls: "bg-success" },
      inactive: { label: "Pasif", cls: "bg-secondary" },
      trial: { label: "Deneme", cls: "bg-info" },
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

  return (
    <>
      {/* Sayfa Başlığı + Ekle Butonu */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Firmalar</h2>
          <p className="text-muted small mb-0">Sisteme kayıtlı tüm firmalar</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Firma Ekle
        </button>
      </div>

      {/* Tablo */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent border-bottom-0 pt-4 px-4">
          <h4 className="card-title mb-0">Firma Listesi</h4>
        </div>
        <div className="card-body px-0">
          <div className="table-responsive px-4">
            <table className="table table-striped align-middle mb-0" id="firma-table" role="grid">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 40 }}></th>
                  <th>Firma Adı</th>
                  <th>Subdomain</th>
                  <th>Yetkili Adı</th>
                  <th>Yetkili E-posta</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th style={{ minWidth: 100 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 bg-soft-primary text-primary fw-bold"
                        style={{ width: 38, height: 38, fontSize: 13 }}
                      >
                        {initialLetters(t.name)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{t.name}</td>
                    <td className="text-muted">
                      <code>{t.subdomain}</code>
                    </td>
                    <td className="text-muted small">{t.contact_name || "—"}</td>
                    <td className="text-muted small">{t.contact_email || "—"}</td>
                    <td>{statusBadge(t.status)}</td>
                    <td className="text-muted small">
                      {new Date(t.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-icon btn-warning"
                          title="Düzenle"
                          onClick={() => openEdit(t)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-sm btn-icon btn-danger"
                          title="Sil"
                          onClick={() => handleDelete(t.id)}
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
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  {editTenant ? "Firma Düzenle" : "Yeni Firma Ekle"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Temel Bilgiler */}
                  <h6 className="fw-semibold text-muted mb-3">Firma Bilgileri</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Firma Adı <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        placeholder="Örn: Tavuk Dünyası"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Subdomain <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          placeholder="tavukdunyasi"
                          value={form.subdomain}
                          onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                          required
                        />
                        <span className="input-group-text text-muted small">.restoranim.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Durum</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                        <option value="trial">Deneme</option>
                      </select>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* İletişim Bilgileri */}
                  <h6 className="fw-semibold text-muted mb-3">Firma Yetkili İletişim Bilgileri</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Yetkili Adı Soyadı</label>
                      <input
                        className="form-control"
                        placeholder="Örn: Ahmet Yılmaz"
                        value={form.contact_name}
                        onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Yetkili E-posta</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="ornek@firma.com"
                        value={form.contact_email}
                        onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Yetkili Telefon</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="0555 123 45 67"
                        value={form.contact_phone}
                        onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Admin Kullanıcı (sadece ekleme modunda) */}
                  {!editTenant && (
                    <>
                      <hr className="my-4" />
                      <h6 className="fw-semibold text-muted mb-3">
                        Firma Admin Kullanıcısı <span className="text-danger">*</span>
                        <span className="fw-normal text-muted ms-2 small">
                          (Bu bilgilerle firma admin panele giriş yapacak)
                        </span>
                      </h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Ad Soyad <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required={!editTenant}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">E-posta <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="admin@firma.com"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required={!editTenant}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Şifre <span className="text-danger">*</span></label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="En az 6 karakter"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required={!editTenant}
                            minLength={6}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {modalError && (
                    <div className="alert alert-danger py-2 small mb-0" role="alert">
                      {modalError}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                    {modalLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Kaydediliyor...
                      </>
                    ) : (
                      editTenant ? "Kaydet" : "Firmayı Oluştur"
                    )}
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