"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";

interface RegionalManager {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

interface ManagerForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

const defaultForm: ManagerForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
};

export default function BolgeMudurleriPage() {
  const [managers, setManagers] = useState<RegionalManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editManager, setEditManager] = useState<RegionalManager | null>(null);
  const [form, setForm] = useState<ManagerForm>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const { user } = useUser();
  const supabase = createClient();

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, status, created_at")
      .eq("role", "bolge_muduru")
      .eq("tenant_id", user?.tenant_id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setManagers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.tenant_id) {
      fetchManagers();
    }
  }, [user?.tenant_id]);

  const openAdd = () => {
    setEditManager(null);
    setForm({ ...defaultForm });
    setMessage("");
    setShowModal(true);
  };

  const openEdit = (m: RegionalManager) => {
    setEditManager(m);
    setForm({
      full_name: m.full_name,
      email: m.email,
      phone: m.phone ?? "",
      password: "",
    });
    setMessage("");
    setShowModal(true);
  };

  const handleFormChange = (field: keyof ManagerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      setMessage("Ad soyad ve e-posta zorunludur");
      return;
    }

    setSaving(true);
    setMessage("");

    if (editManager) {
      // Güncelleme: users tablosunda ad, telefon güncelle
      const updates: Record<string, string | null> = {
        full_name: form.full_name,
        phone: form.phone || null,
      };

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", editManager.id);

      if (error) {
        setMessage("Hata: " + error.message);
        setSaving(false);
        return;
      }

      // Şifre değişikliği varsa Auth üzerinden güncelle
      if (form.password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          editManager.id,
          { password: form.password }
        );
        if (authError) {
          setMessage("Şifre değiştirme hatası: " + authError.message);
          setSaving(false);
          return;
        }
      }

      setMessage("Bölge müdürü güncellendi ✅");
    } else {
      // Yeni kullanıcı: Supabase Auth signUp + users tablosuna ekle
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || "123456",
        options: {
          data: {
            full_name: form.full_name,
          },
        },
      });

      if (authError) {
        setMessage("Hata: " + authError.message);
        setSaving(false);
        return;
      }

      if (!authData.user) {
        setMessage("Kullanıcı oluşturulamadı");
        setSaving(false);
        return;
      }

      // users tablosuna kaydı ekle
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone || null,
        role: "bolge_muduru",
        status: "active",
        tenant_id: user?.tenant_id,
      });

      if (insertError) {
        setMessage("Hata: " + insertError.message);
        setSaving(false);
        return;
      }

      setMessage("Bölge müdürü eklendi ✅");
    }

    setSaving(false);
    setShowModal(false);
    fetchManagers();
  };

  const handleDeactivate = async (m: RegionalManager) => {
    if (!confirm(`${m.full_name} kullanıcısını pasife almak istediğine emin misin?`)) return;

    const { error } = await supabase
      .from("users")
      .update({ status: "passive" })
      .eq("id", m.id);

    if (error) {
      setMessage("Hata: " + error.message);
    } else {
      setMessage(`${m.full_name} pasife alındı ✅`);
      fetchManagers();
    }
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
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Bölge Müdürleri</h4>
          <p className="text-muted small mb-0">
            Bölge müdürlerini görüntüleyin, yeni bölge müdürü ekleyin veya düzenleyin.
          </p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <FiPlus size={16} />
          Bölge Müdürü Ekle
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
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Telefon</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th style={{ width: 120 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    Henüz bölge müdürü eklenmemiş. "Bölge Müdürü Ekle" butonuna tıklayın.
                  </td>
                </tr>
              ) : (
                managers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary fw-bold"
                          style={{ width: 36, height: 36, fontSize: 14 }}
                        >
                          {m.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{m.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex align-items-center gap-1">
                        <FiMail size={12} className="text-muted" />
                        {m.email}
                      </div>
                    </td>
                    <td>
                      <div className="small d-flex align-items-center gap-1">
                        <FiPhone size={12} className="text-muted" />
                        {m.phone || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {m.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(m.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openEdit(m)}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        {m.status === "active" && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeactivate(m)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editManager ? "Bölge Müdürü Düzenle" : "Yeni Bölge Müdürü Ekle"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small text-muted">Ad Soyad *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.full_name}
                      onChange={(e) => handleFormChange("full_name", e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">E-posta *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      placeholder="ornek@email.com"
                      disabled={!!editManager}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">Telefon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      placeholder="5XX XXX XX XX"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted">
                      {editManager ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.password}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                      placeholder="En az 6 karakter"
                    />
                    {!editManager && (
                      <div className="small text-muted mt-1">
                        Boş bırakılırsa varsayılan şifre: 123456
                      </div>
                    )}
                  </div>
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
                  {saving ? "Kaydediliyor..." : editManager ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}