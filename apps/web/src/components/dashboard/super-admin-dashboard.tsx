'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { FiBell, FiSearch, FiSettings, FiGrid, FiBriefcase, FiCreditCard, FiLifeBuoy, FiUsers, FiChevronRight } from 'react-icons/fi';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const sidebarItems = [
  { label: 'Genel Bakış', href: '/super-admin/hos-geldin', active: true, icon: FiGrid },
  { label: 'Firmalar', href: '/super-admin/firmalar', icon: FiBriefcase },
  { label: 'Abonelikler', href: '/super-admin/abonelikler', icon: FiCreditCard },
  { label: 'Destek Talepleri', href: '/super-admin/destek-talepleri', icon: FiLifeBuoy },
  { label: 'Ayarlar', href: '/super-admin/ayarlar', icon: FiSettings },
];

const stats = [
  { title: 'Aktif Firmalar', value: '12', subtitle: '+3 bu ay', icon: FiBriefcase, tone: 'primary' },
  { title: 'Bekleyen Talepler', value: '4', subtitle: '2 yeni', icon: FiLifeBuoy, tone: 'warning' },
  { title: 'Toplam Restoran', value: '184', subtitle: '12 açık', icon: FiUsers, tone: 'success' },
  { title: 'Aylık Gelir', value: '₺86.4K', subtitle: '+8.2%', icon: FiCreditCard, tone: 'info' },
];

const chartSeries = [
  { name: 'Firmalar', data: [12, 15, 14, 18, 20, 22] },
  { name: 'Restoranlar', data: [80, 92, 96, 104, 112, 124] },
];

const chartOptions: ApexOptions = {
  chart: {
    height: 280,
    type: 'area',
    toolbar: { show: false },
  },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.05 } },
  colors: ['#3a57e8', '#1aa053'],
  xaxis: { categories: ['Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas'] },
  tooltip: { shared: true, intersect: false },
  legend: { position: 'top' as const },
};

export function SuperAdminDashboard() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside className="d-none d-lg-flex flex-column bg-white border-end" style={{ width: 280 }}>
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold" style={{ width: 44, height: 44 }}>
              ODZ
            </div>
            <div>
              <div className="fw-semibold text-dark">ODZ Platform</div>
              <div className="small text-muted">Süper Admin</div>
            </div>
          </div>
        </div>

        <nav className="p-3">
          <div className="small text-uppercase text-muted fw-semibold mb-3">Ana Menü</div>
          <div className="d-flex flex-column gap-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-2 ${item.active ? 'bg-primary text-white' : 'text-dark'}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="flex-grow-1 d-flex flex-column">
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted small">Süper Admin Paneli</div>
            <h1 className="h4 mb-0 fw-bold text-dark">Genel Bakış</h1>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2 bg-light">
              <FiSearch size={16} className="text-muted" />
              <span className="small text-muted">Ara</span>
            </div>
            <button className="btn btn-light rounded-circle position-relative" type="button" aria-label="Bildirimler">
              <FiBell size={16} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
            </button>
            <div className="d-flex align-items-center gap-2">
              <div className="text-end">
                <div className="fw-semibold text-dark">Ahmet Yılmaz</div>
                <div className="small text-muted">Süper Admin</div>
              </div>
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-semibold" style={{ width: 42, height: 42 }}>
                AY
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 p-lg-5">
          <div className="row g-4 mb-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="col-12 col-md-6 col-xl-3">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div className="small text-muted mb-2">{stat.title}</div>
                          <div className="display-6 fw-bold text-dark">{stat.value}</div>
                        </div>
                        <div className={`rounded-circle p-2 bg-${stat.tone} bg-opacity-10 text-${stat.tone}`}>
                          <Icon size={18} />
                        </div>
                      </div>
                      <div className="small text-success">{stat.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h5 fw-bold text-dark mb-1">Firma ve Restoran Gelişimi</h2>
                      <p className="text-muted small mb-0">Aylık trendleri takip edin</p>
                    </div>
                    <span className="badge bg-primary-subtle text-primary">Canlı</span>
                  </div>
                  <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={280} />
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold text-dark mb-3">Hızlı Erişim</h2>
                  <div className="d-grid gap-2">
                    <Link href="/super-admin/firmalar" className="btn btn-outline-primary text-start d-flex justify-content-between align-items-center">
                      <span>Firmaları Yönet</span>
                      <FiChevronRight />
                    </Link>
                    <Link href="/super-admin/abonelikler" className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center">
                      <span>Abonelikleri İncele</span>
                      <FiChevronRight />
                    </Link>
                    <Link href="/super-admin/destek-talepleri" className="btn btn-outline-info text-start d-flex justify-content-between align-items-center">
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

                  <div className="list-group list-group-flush">
                    {['X Pide Zincirleri yeni firma kaydı oluşturdu', 'Destek talebi cevap bekliyor', 'Yeni abonelik planı aktifleştirildi', 'Yeni restoran eklenerek abonelik başlatıldı'].map((item) => (
                      <div key={item} className="list-group-item px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-dark">{item}</span>
                          <span className="small text-muted">Bugün</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h2 className="h5 fw-bold text-dark mb-3">Yönetim Özeti</h2>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { label: 'Yeni üyelik başvuruları', value: '8' },
                      { label: 'Onay bekleyen firmalar', value: '3' },
                      { label: 'Aylık hedef', value: '92%' },
                    ].map((item) => (
                      <div key={item.label} className="d-flex justify-content-between align-items-center border rounded-3 p-3">
                        <span className="text-muted">{item.label}</span>
                        <span className="fw-semibold text-dark">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
