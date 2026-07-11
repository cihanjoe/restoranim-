"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface VisitItem {
  id: string;
  created_at: string | null;
  completed_at: string | null;
  status: string;
  visited_by_name: string;
  total_questions: number;
  answered_questions: number;
}

export default function ZiyaretGecmisiPage() {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchVisits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const uid = session.user.id;

      // Restoran müdürünün restoranını bul
      const { data: rmData } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("manager_user_id", uid)
        .single();

      if (!rmData) {
        setVisits([]);
        setLoading(false);
        return;
      }

      // Bu restoranın ziyaretlerini getir
      const { data } = await supabase
        .from("odz_visits")
        .select(`
          id, created_at, completed_at, status,
          visited_by:users!visited_by_user_id (full_name),
          odz_visit_answers (id)
        `)
        .eq("restaurant_id", rmData.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setVisits(
        (data ?? []).map((v: any) => ({
          id: v.id,
          created_at: v.created_at,
          completed_at: v.completed_at,
          status: v.status,
          visited_by_name: v.visited_by?.full_name ?? "Bilinmeyen",
          total_questions: v.odz_visit_answers?.length ?? 0,
          answered_questions: 0, // ileride detaylı hesaplanabilir
        }))
      );
      setLoading(false);
    };

    fetchVisits();
  }, []);

  // Ziyaretleri aylara göre grupla
  const groupedByMonth: Record<string, VisitItem[]> = {};
  for (const visit of visits) {
    if (!visit.created_at) continue;
    const d = new Date(visit.created_at);
    const key = `${d.getFullYear()} ${d.toLocaleString("tr-TR", { month: "long" })}`;
    if (!groupedByMonth[key]) groupedByMonth[key] = [];
    groupedByMonth[key].push(visit);
  }

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-warning text-dark",
      completed: "bg-success",
      notified: "bg-info",
    };
    const labels: Record<string, string> = {
      draft: "Taslak",
      completed: "Tamamlandı",
      notified: "Bildirildi",
    };
    return (
      <span className={`badge ${map[status] ?? "bg-secondary"}`}>
        {labels[status] ?? status}
      </span>
    );
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

  if (visits.length === 0) {
    return (
      <div className="text-center py-5">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted mb-3">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <h5 className="text-muted">Henüz ziyaret kaydı bulunmuyor</h5>
        <p className="text-muted small">Bölge müdürünüz tarafından yapılan ziyaretler burada kronolojik sırayla listelenecek.</p>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold text-dark mb-1">Ziyaret Geçmişi</h2>
          <p className="text-muted small mb-0">
            {visits.length} ziyaret — kronolojik sıralama
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="iq-timeline m-0 d-flex align-items-center justify-content-between position-relative">
                <ul className="list-inline p-0 m-0 w-100">
                  {Object.entries(groupedByMonth).map(([month, monthVisits]) => (
                    <li key={month}>
                      <div className="time bg-primary">
                        <span>{month}</span>
                      </div>
                      {monthVisits.map((v) => (
                        <div key={v.id} className="content ps-4 pb-3">
                          <div className="timeline-dots new-timeline-dots border-primary" />
                          <h6 className="mb-1">
                            {v.visited_by_name} tarafından ziyaret
                          </h6>
                          <div className="d-inline-block w-100">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              {statusBadge(v.status)}
                              <small className="text-muted">
                                {formatDateTime(v.created_at)}
                              </small>
                            </div>
                            <p className="small text-muted mb-0">
                              {v.completed_at
                                ? `Ziyaret ${formatDateTime(v.completed_at)} tarihinde tamamlandı`
                                : "Ziyaret henüz tamamlanmadı"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Özet kartı */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Özet</h6>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Toplam Ziyaret</span>
                  <span className="fw-bold">{visits.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Tamamlanan</span>
                  <span className="fw-bold text-success">
                    {visits.filter((v) => v.status === "completed").length}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Taslak</span>
                  <span className="fw-bold text-warning">
                    {visits.filter((v) => v.status === "draft").length}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Bildirilen</span>
                  <span className="fw-bold text-info">
                    {visits.filter((v) => v.status === "notified").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .iq-timeline ul {
          list-style: none;
        }
        .iq-timeline ul li {
          position: relative;
        }
        .iq-timeline .time {
          display: inline-block;
          border-radius: 40px;
          padding: 6px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 20px;
          margin-top: 10px;
        }
        .iq-timeline .content {
          position: relative;
          padding-left: 30px;
          border-left: 2px dashed #e9ecef;
          margin-left: 4px;
        }
        .iq-timeline .content:last-child {
          border-left: 2px dashed transparent;
          padding-bottom: 0 !important;
        }
        .timeline-dots {
          position: absolute;
          left: -9px;
          top: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid;
        }
        .new-timeline-dots {
          top: -2px;
        }
      `}</style>
    </>
  );
}