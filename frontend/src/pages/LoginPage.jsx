import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', client: '100', language: 'EN' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.username, form.password);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/auth/seed');
      alert(res.data.message);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Seed failed');
    }
    setSeeding(false);
  };

  return (
    <div className="login-wrap">
      <div style={{ width: 420 }}>
        {/* SAP Title bar */}
        <div style={{ background: '#003399', color: '#fff', padding: '3px 8px', fontSize: 12, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>SAP</span>
          <span style={{ fontSize: 10 }}>Mini ERP v7.00</span>
        </div>

        <div style={{ background: '#d4d0c8', border: '1px solid #808080', padding: 20 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 52, fontWeight: 'bold', color: '#003399', fontFamily: 'Arial', lineHeight: 1 }}>SAP</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Mini ERP System | Client {form.client} | EN</div>
          </div>

          {error && (
            <div style={{ background: '#fdecea', border: '1px solid #f5c2c0', color: '#cc0000', padding: '3px 8px', fontSize: 11, marginBottom: 8 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ border: '1px solid #808080', padding: '8px 10px', marginBottom: 8 }}>
              <legend style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>Logon Data</legend>

              <div className="sap-field-row" style={{ marginBottom: 4 }}>
                <span className="sap-field-label" style={{ width: 80 }}>Client</span>
                <input className="sap-input" style={{ width: 60 }} value={form.client}
                  onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
              </div>
              <div className="sap-field-row" style={{ marginBottom: 4 }}>
                <span className="sap-field-label" style={{ width: 80 }}>User</span>
                <input className="sap-input required" style={{ width: 180 }} placeholder="Username"
                  value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.toUpperCase() }))}
                  autoFocus autoComplete="username" />
              </div>
              <div className="sap-field-row" style={{ marginBottom: 4 }}>
                <span className="sap-field-label" style={{ width: 80 }}>Password</span>
                <input className="sap-input required" style={{ width: 180 }} type="password" placeholder="Password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password" />
              </div>
              <div className="sap-field-row">
                <span className="sap-field-label" style={{ width: 80 }}>Language</span>
                <input className="sap-input" style={{ width: 40 }} value={form.language}
                  onChange={e => setForm(p => ({ ...p, language: e.target.value.toUpperCase() }))} maxLength={2} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button type="submit" className="sap-btn primary" disabled={loading}>
                {loading ? 'Logging in...' : '✓ Log On'}
              </button>
              <button type="button" className="sap-btn" onClick={handleSeed} disabled={seeding}>
                {seeding ? 'Seeding...' : '⚙ Seed Admin'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 12, fontSize: 10, color: '#555', borderTop: '1px solid #808080', paddingTop: 8 }}>
            <div>Default: <strong>ADMIN / Admin@1234</strong> (click Seed Admin first if new install)</div>
          </div>
        </div>

        <div style={{ background: '#c0bdb5', padding: '2px 8px', fontSize: 10, color: '#444', border: '1px solid #808080', borderTop: 'none' }}>
          SAP NetWeaver | Server: ERPSRV01 | ©2026 Mini SAP ERP
        </div>
      </div>
    </div>
  );
}
