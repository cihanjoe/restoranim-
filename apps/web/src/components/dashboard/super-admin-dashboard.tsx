"use client";

import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import {
  ChartWidgetCard,
  CircularProgressCard,
  StatCard,
} from "@/components/hope-ui/widgets";
import { createClient } from "@/lib/supabase/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type DashboardData = {
  activeTenants: number;
  totalTenants: number;
  newTenantsThisMonth: number;
  totalRestaurants: number;
  pendingTickets: number;
  monthlyRevenue: number;
  monthlyTenantData: number[];
  monthlyRestaurantData: number[];
  recentItems: { text: string; date: string }[];
  pendingApprovals: number;
  newMemberships: number;
  monthlyGoal: number;
};

const MONTHS_LABELS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function getMonthRange(monthsAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      try {
        const { start, end } = getMonthRange(6);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // --- TENANTS ---
        const { count: totalTenants } = await supabase
          .from("tenants")
          .select("*", { count: "exact", head: true });

        const { count: activeTenants } = await supabase
          .from("tenants")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        const { count: newTenantsThisMonth } = await supabase
          .from("tenants")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString());

        // --- RESTAURANTS ---
        const { count: totalRestaurants } = await supabase
          .from("restaurants")
          .select("*", { count: "exact", head: true });

        // --- SUPPORT TICKETS ---
        const { count: pendingTickets } = await supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        // --- Aylık firma ve restoran trendi (son 6 ay) ---
        const monthlyTenantData: number[] = [];
        const monthlyRestaurantData: number[] = [];

        for (let i = 5; i >= 0; i--) {
          const r = getMonthRange(i);
          const { count: tc } = await supabase
            .from("tenants")
            .select("*", { count: "exact", head: true })
            .lte("created_at", r.end.toISOString());

          const { count: rc } = await supabase
            .from("restaurants")
            .select("*", { count: "exact", head: true })
            .lte("created_at", r.end.toISOString());

          monthlyTenantData.push(tc ?? 0);
          monthlyRestaurantData.push(rc ?? 0);
        }

        // --- BILLING (yaklaşık aylık gelir - subscription_plans henüz dolmadıysa 0) ---
        const { data: billingData } = await supabase
          .from("billing_records")
          .select("amount")
          .eq("status", "paid")
          .gte("created_at", monthStart.toISOString());

        const monthlyRevenue =
          billingData?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0;

        // --- Son işlemler (support_tickets üzerinden) ---
        const { data: recentTickets } = await supabase
          .from("support_tickets")
          .select("subject, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        const recentItems: { text: string; date: string }[] = [];

        if (recentTickets) {
          for (const t of recentTickets) {
            recentItems.push({
              text: `Yeni destek talebi: "${t.subject}"`,
              date: new Date(t.created_at).toLocaleDateString("tr-TR"),
            });
          }
        }

        // Yeni tenant varsa ekle
        if (newTenantsThisMonth && newTenantsThisMonth > 0) {
          const { data: newTens } = await supabase
            .from("tenants")
            .select("name")
            .gte("created_at", monthStart.toISOString())
            .limit(3);

          if (newTens) {
            for (const t of newTens) {
              recentItems.unshift({
                text: `${t.name} yeni firma kaydı oluşturdu`,
                date: "Bu ay",
              });
            }
          }
        }

        setData({
          activeTenants: activeTenants ?? 0,
          totalTenants: totalTenants ?? 0,
          newTenantsThisMonth: newTenantsThisMonth ?? 0,
          totalRestaurants: totalRestaurants ?? 0,
          pendingTickets: pendingTickets ?? 0,
          monthlyRevenue,
          monthlyTenantData,
          monthlyRestaurantData,
          recentItems,
          pendingApprovals: pendingTickets ?? 0,
          newMemberships: newTenantsThisMonth ?? 0,
          monthlyGoal: totalTenants && totalTenants > 0 ? Math.min(100, Math.round(((activeTenants ?? 0) / totalTenants) * 100)) : 0,
        });
      } catch (err) {
        console.error("Dashboard verisi yüklenirken hata:", err);
        // Hata durumunda boş veri göster
        setData({
          activeTenants: 0,
          totalTenants: 0,
          newTenantsThisMonth: 0,
          totalRestaurants: 0,
          pendingTickets: 0,
          monthlyRevenue: 0,
          monthlyTenantData: [0, 0, 0, 0, 0, 0],
          monthlyRestaurantData: [0, 0, 0, 0, 0, 0],
          recentItems: [],
          pendingApprovals: 0,
          newMemberships: 0,
          monthlyGoal: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chartOptions: ApexOptions = {
    chart: {
      height: 280,
      type: "area",
      toolbar: { show: false },
    },
    colors: ["#3a57e8", "#1aa053"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.05 } },
    legend: { position: "top" as const },
    stroke: { curve: "smooth", width: 2 },
    tooltip: { shared: true, intersect: false },
    xaxis: {
      categories: MONTHS_LABELS.slice(new Date().getMonth() - 5, new Date().getMonth() + 1),
    },
  };

  const chartSeries = [
    { name: "Firmalar", data: data.monthlyTenantData },
    { name: "Restoranlar", data: data.monthlyRestaurantData },
  ];

  const formatRevenue = (val: number) => {
    if (val >= 1000) return `₺${(val / 1000).toFixed(1)}K`;
    return `₺${val}`;
  };

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            change={`+${data.newTenantsThisMonth} bu ay`}
            color="primary"
            progress={data.totalTenants > 0 ? Math.round((data.activeTenants / data.totalTenants) * 100) : 0}
            title="Aktif Firmalar"
            value={String(data.activeTenants)}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            change={`${data.pendingTickets} açık`}
            color="warning"
            progress={data.pendingTickets > 0 ? 100 : 0}
            title="Bekleyen Talepler"
            trend="down"
            value={String(data.pendingTickets)}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <CircularProgressCard
            color="success"
            detail={`${data.totalRestaurants} toplam`}
            progress={data.totalRestaurants > 0 ? Math.min(100, Math.round((data.totalRestaurants / 1000) * 100)) : 0}
            title="Toplam Restoran"
            value={String(data.totalRestaurants)}
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <CircularProgressCard
            color="info"
            detail={data.monthlyRevenue > 0 ? `+${data.monthlyRevenue > 1000 ? "%" : "₺"}${data.monthlyRevenue > 1000 ? ((data.monthlyRevenue / 1000) * 0.1).toFixed(1) : data.monthlyRevenue}` : "Henüz veri yok"}
            progress={data.monthlyRevenue > 0 ? Math.min(100, Math.round((data.monthlyRevenue / 100000) * 100)) : 0}
            title="Aylık Gelir"
            value={data.monthlyRevenue > 0 ? formatRevenue(data.monthlyRevenue) : "₺0"}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <ChartWidgetCard
            badge="Aylık"
            color="primary"
            data={data.monthlyTenantData}
            title="Firma Aktivasyonu"
            value={String(data.totalTenants)}
          />
        </div>
        <div className="col-12 col-lg-4">
          <ChartWidgetCard
            badge="Bugün"
            color="danger"
            data={[data.pendingTickets > 0 ? data.pendingTickets : 0]}
            title="Bekleyen Onay"
            value={String(data.pendingTickets)}
          />
        </div>
        <div className="col-12 col-lg-4">
          <ChartWidgetCard
            badge="Aylık"
            color="success"
            data={data.monthlyRestaurantData}
            title="Restoran Büyümesi"
            value={String(data.totalRestaurants)}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="h5 fw-bold text-dark mb-1">Firma ve Restoran Gelişimi</h2>
                  <p className="text-muted small mb-0">Aylık kümülatif trend</p>
                </div>
                <span className="badge bg-primary-subtle text-primary">Canlı</span>
              </div>
              <ReactApexChart height={280} options={chartOptions} series={chartSeries} type="area" />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-dark mb-3">Hızlı Erişim</h2>
              <div className="d-grid gap-2">
                <Link className="btn btn-outline-primary text-start d-flex justify-content-between align-items-center" href="/super-admin/firmalar">
                  <span>Firmaları Yönet</span>
                  <FiChevronRight />
                </Link>
                <Link className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center" href="/super-admin/abonelikler">
                  <span>Abonelikleri İncele</span>
                  <FiChevronRight />
                </Link>
                <Link className="btn btn-outline-info text-start d-flex justify-content-between align-items-center" href="/super-admin/destek-talepleri">
                  <span>Destek Taleplerini Gör</span>
                  <FiChevronRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="h5 fw-bold text-dark mb-1">Son İşlemler</h2>
                  <p className="text-muted small mb-0">En son yapılan firma ve destek faaliyetleri</p>
                </div>
                <span className="badge bg-primary-subtle text-primary">Canlı</span>
              </div>

              {data.recentItems.length > 0 ? (
                <div className="list-group list-group-flush">
                  {data.recentItems.map((item, idx) => (
                    <div className="list-group-item px-0 py-3" key={idx}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-dark">{item.text}</span>
                        <span className="small text-muted">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p className="mb-0">Henüz işlem bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-dark mb-3">Yönetim Özeti</h2>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                  <span className="text-muted">Yeni üyelik başvuruları</span>
                  <span className="fw-semibold text-dark">{data.newMemberships}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                  <span className="text-muted">Açık destek talepleri</span>
                  <span className="fw-semibold text-dark">{data.pendingTickets}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                  <span className="text-muted">Aktif firma oranı</span>
                  <span className="fw-semibold text-dark">%{data.monthlyGoal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}