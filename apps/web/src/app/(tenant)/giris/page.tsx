import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                    <span className="fs-3 fw-bold text-primary">ODZ</span>
                  </div>
                  <h1 className="h3 fw-bold mb-2">Hoş geldiniz</h1>
                  <p className="text-muted mb-0">
                    Restoran operasyonlarını tek merkezden yönetmeye başlayın.
                  </p>
                </div>

                <LoginForm />

                <div className="text-center mt-4">
                  <Link href="/" className="text-decoration-none text-primary fw-semibold">
                    Ana sayfaya dön
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
