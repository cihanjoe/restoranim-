'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const FirmalarPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState({ name: '', subdomain: '', status: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('tenants').select('name, subdomain, status, created_at');
    if (error) console.error(error);
    else setCompanies(data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tenants').insert([newCompany]);
    if (error) console.error(error);
    setShowModal(false);
    setNewCompany({ name: '', subdomain: '', status: '' });
    fetchCompanies();
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} style={{ marginBottom: '1rem' }}>
        Yeni Firma Ekle
      </button>
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px' }}>
            <form onSubmit={handleAddCompany}>
              <div>
                <label>Firma Adı:</label>
                <input
                  placeholder="Firma Adı"
                  value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div>
                <label>Subdomain:</label>
                <input
                  placeholder="Subdomain"
                  value={newCompany.subdomain}
                  onChange={e => setNewCompany({ ...newCompany, subdomain: e.target.value })}
                />
              </div>
              <div>
                <label>Durum:</label>
                <select
                  value={newCompany.status}
                  onChange={e => setNewCompany({ ...newCompany, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: '1rem' }}>
                Ekle
              </button>
            </form>
          </div>
        </div>
      )}
      <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Firma Adı</th>
            <th>Subdomain</th>
            <th>Durum</th>
            <th>Oluşturulma Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c: any, idx: number) => (
            <tr key={idx}>
              <td>{c.name}</td>
              <td>{c.subdomain}</td>
              <td>{c.status}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FirmalarPage;