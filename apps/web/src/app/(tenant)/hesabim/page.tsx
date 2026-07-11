"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Tab,
  Nav,
  Card,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";

type UserInfo = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Süper Admin",
  firma_admin: "Firma Admin",
  bolge_muduru: "Bölge Müdürü",
  restoran_muduru: "Restoran Müdürü",
};

export default function HesabimPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const authUser = session.user;

      const { data } = await supabase
        .from("users")
        .select("id, full_name, email, phone, role, avatar_url, created_at")
        .eq("id", authUser.id)
        .single();

      if (data) {
        const u = data as UserInfo;
        setUser(u);
        setFullName(u.full_name);
        setPhone(u.phone ?? "");
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg("");

    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", user.id);

    if (error) {
      setSaveMsg("Hata: " + error.message);
    } else {
      setSaveMsg("Profil bilgileri güncellendi ✅");
      setUser((prev) => prev ? { ...prev, full_name: fullName, phone: phone || null } : prev);
    }

    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordMsg("Yeni şifreler eşleşmiyor");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg("Şifre en az 6 karakter olmalı");
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMsg("Hata: " + error.message);
    } else {
      setPasswordMsg("Şifre başarıyla değiştirildi ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setChangingPassword(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  if (!user) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.</h5>
      </div>
    );
  }

  return (
    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k ?? "profile")}>
      {/* Profile Header */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold me-3"
                style={{ width: 80, height: 80, fontSize: 28 }}
              >
                {getInitials(user.full_name)}
              </div>
              <div className="d-flex flex-wrap align-items-center mb-2 mb-sm-0">
                <h4 className="me-2 h4 mb-0">{user.full_name}</h4>
                <span className="text-muted">— {ROLE_LABELS[user.role] ?? user.role}</span>
              </div>
            </div>

            <Nav
              as="ul"
              className="d-flex nav-pills mb-0 text-center profile-tab"
            >
              <Nav.Item as="li">
                <Nav.Link eventKey="profile">Profil</Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link eventKey="activity">Aktivite</Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link eventKey="security">Güvenlik</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Card.Body>
      </Card>

      <Tab.Content>
        {/* === PROFİL TAB === */}
        <Tab.Pane eventKey="profile">
          <Row>
            <Col lg="8">
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-transparent border-bottom">
                  <h5 className="fw-bold mb-0">Bilgilerim</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSaveProfile(); }}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Ad Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">E-posta</Form.Label>
                      <Form.Control
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">E-posta değiştirilemez</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Telefon</Form.Label>
                      <Form.Control
                        type="tel"
                        value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                        placeholder="5XX XXX XX XX"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Rol</Form.Label>
                      <Form.Control
                        type="text"
                        value={ROLE_LABELS[user.role] ?? user.role}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Kayıt Tarihi</Form.Label>
                      <Form.Control
                        type="text"
                        value={new Date(user.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>

                    {saveMsg && (
                      <div className={`alert ${saveMsg.includes("✅") ? "alert-success" : "alert-danger"} py-2 small`}>
                        {saveMsg}
                      </div>
                    )}

                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg="4">
              <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Header className="bg-transparent border-bottom">
                  <h6 className="fw-bold mb-0">Hesap Özeti</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-muted">Rol</span>
                    <span className="small fw-semibold">{ROLE_LABELS[user.role] ?? user.role}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small text-muted">Durum</span>
                    <span className="badge bg-success">Aktif</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Üyelik</span>
                    <span className="small">
                      {new Date(user.created_at).toLocaleDateString("tr-TR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>

        {/* === AKTİVİTE TAB === */}
        <Tab.Pane eventKey="activity">
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-transparent border-bottom">
              <h5 className="fw-bold mb-0">Son Aktiviteler</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-4">
                Ziyaretler, aksiyonlar ve diğer işlemler burada kronolojik sırayla listelenecek.
              </p>
              <div className="iq-timeline0 m-0 d-flex align-items-center justify-content-between position-relative">
                <ul className="list-inline p-0 m-0">
                  <li className="d-flex mb-3">
                    <div className="timeline-dots timeline-dot1 border-primary text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-1 small fw-semibold">Hesap oluşturuldu</h6>
                      <small className="text-muted">
                        {new Date(user.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Tab.Pane>

        {/* === GÜVENLİK TAB === */}
        <Tab.Pane eventKey="security">
          <Row>
            <Col lg="6">
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-transparent border-bottom">
                  <h5 className="fw-bold mb-0">Şifre Değiştir</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleChangePassword(); }}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Yeni Şifre</Form.Label>
                      <Form.Control
                        type="password"
                        value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Yeni Şifre (Tekrar)</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        placeholder="Şifreyi tekrar girin"
                        required
                      />
                    </Form.Group>

                    {passwordMsg && (
                      <div className={`alert ${passwordMsg.includes("✅") ? "alert-success" : "alert-danger"} py-2 small`}>
                        {passwordMsg}
                      </div>
                    )}

                    <Button type="submit" variant="primary" disabled={changingPassword}>
                      {changingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab.Pane>
      </Tab.Content>
      <style jsx>{`
        .profile-tab .nav-link {
          color: #6c757d;
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 14px;
        }
        .profile-tab .nav-link.active {
          background-color: #3a57e8;
          color: #fff;
        }
        .iq-timeline0 ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .iq-timeline0 ul li {
          position: relative;
        }
        .timeline-dots {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #fff;
          border: 2px solid;
        }
      `}</style>
    </Tab.Container>
  );
}