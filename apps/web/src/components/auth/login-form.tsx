'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const roleRedirects = {
  super_admin: '/super-admin/hos-geldin',
  firma_admin: '/firma-admin/hos-geldin',
  bolge_muduru: '/bolge-muduru/hos-geldin',
  restoran_muduru: '/restoran-muduru/hos-geldin',
} as const;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setErrorMessage('Oturum açıldı ancak kullanıcı kimliği alınamadı.');
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, status, tenant_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      setErrorMessage('Kullanıcı profili okunurken bir hata oluştu.');
      setIsLoading(false);
      return;
    }

    if (!profile || profile.status !== 'active') {
      setErrorMessage('Bu kullanıcı aktif değil veya sistemde kayıtlı değil.');
      setIsLoading(false);
      return;
    }

    const redirectPath =
      roleRedirects[profile.role as keyof typeof roleRedirects] ?? '/hos-geldin';

    router.replace(redirectPath);
    setIsLoading(false);
  }

  return (
    <form className="needs-validation" noValidate onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-semibold" htmlFor="email">
          E-posta adresi
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="form-control form-control-lg"
          placeholder="ornek@firma.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold" htmlFor="password">
          Parola
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="form-control form-control-lg"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {errorMessage ? (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>
        {isLoading ? 'Oturum açılıyor…' : 'Giriş yap'}
      </button>
    </form>
  );
}
