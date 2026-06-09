import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

const ROLES = ['ADMIN', 'HR', 'FINANCE', 'SALES', 'INVENTORY', 'VIEWER'];

export default function SU01Screen() {
  const { setStatus } = useERP();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'VIEWER' });
  const [tab, setTab] = useState(0);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(r.data); } catch (e) { setStatus(e.response?.data?.message || 'Load failed — Admin role required.', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) return setStatus('Username and password required.', 'error');
    try {
      await api.post('/users', form);
      setStatus(`User ${form.username} created.`, 'success');
      setShowCreate(false);
      setForm({ username: '', password: '', fullName: '', email: '', role: 'VIEWER' });
      load();
    } catch (e) { setStatus(e.response?.data?.message || 'Create failed', 'error'); }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/users/${selected.username}`, { role: form.role, fullName: form.fullName, email: form.email });
      setStatus(`User ${selected.username} updated.`, 'success');
      setSelected(null); load();
    } catch (e) { setStatus('Update failed', 'error'); }
  };

  const toggleLock = async (user) => {
    try {
      const endpoint = user.isLocked ? 'unlock' : 'lock';
      const r = await api.post(`/users/${user.username}/${endpoint}`);
      setStatus(r.data.message, 'success');
      load();
    } catch (e) { setStatus('Action failed', 'error'); }
  };

  const ROLE_COLORS = { ADMIN: '#cc0000', HR: '#003399', FINANCE: '#006600', SALES: '#7a5000', INVENTORY: '#9900cc', VIEWER: '#555' };

  return (
    <div>
      <div className="sap-screen-header"><span>User Maintenance &nbsp;[SU01]</span></div>
      <div className="sap-tabs">
        {['User List', 'Create User', selected ? `Edit: ${selected.username}` : null].filter(Boolean).map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={() => { setShowCreate(true); setTab(1); }}>Create User (F5)</button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Client</th><th>Last Login</th><th>Logins</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8 }}>Loading... (Admin role required)</td></tr>
                  : users.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No users found or insufficient permissions.</td></tr>
                  : users.map(u => (
                  <tr key={u._id} className={selected?._id === u._id ? 'selected' : ''}>
                    <td className="mono bold">{u.username}</td>
                    <td>{u.fullName}</td>
                    <td style={{ fontSize: 10 }}>{u.email}</td>
                    <td style={{ color: ROLE_COLORS[u.role], fontWeight: 'bold' }}>{u.role}</td>
                    <td>{u.client}</td>
                    <td style={{ fontSize: 10 }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td className="num">{u.loginCount || 0}</td>
                    <td className={u.isLocked ? 'red' : 'green'}>{u.isLocked ? '🔒 Locked' : '✓ Active'}</td>
                    <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      <button className="sap-btn" style={{ fontSize: 10, marginRight: 2 }} onClick={() => { setSelected(u); setForm({ username: u.username, fullName: u.fullName, email: u.email, role: u.role }); setTab(2); }}>Edit</button>
                      <button className="sap-btn" style={{ fontSize: 10, color: u.isLocked ? '#006600' : '#cc0000' }} onClick={() => toggleLock(u)}>
                        {u.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="p8">
          <div className="sap-fieldset">
            <legend>Create User</legend>
            {[['Username', 'username', true], ['Password', 'password', true], ['Full Name', 'fullName', true], ['Email', 'email']].map(([label, key, req]) => (
              <div className="sap-field-row" key={key}>
                <span className="sap-field-label">{label}:</span>
                <input
                  className={`sap-input${req ? ' required' : ''}${key === 'username' ? ' mono' : ''}`}
                  style={{ width: 220, textTransform: key === 'username' ? 'uppercase' : 'none' }}
                  type={key === 'password' ? 'password' : 'text'}
                  value={form[key] || ''}
                  onChange={e => setForm(p => ({ ...p, [key]: key === 'username' ? e.target.value.toUpperCase() : e.target.value }))}
                />
              </div>
            ))}
            <div className="sap-field-row">
              <span className="sap-field-label">Role:</span>
              <select className="sap-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <span style={{ fontSize: 10, color: '#555', marginLeft: 8 }}>
                {form.role === 'ADMIN' ? 'Full access to all modules' : form.role === 'VIEWER' ? 'Read-only access' : `Access to ${form.role} module`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={handleCreate}>✓ Create User</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 2 && selected && (
        <div className="p8">
          <div className="sap-fieldset">
            <legend>Edit User — {selected.username}</legend>
            <div className="sap-field-row"><span className="sap-field-label">Username:</span><input className="sap-input readonly mono" value={selected.username} readOnly style={{ width: 160 }} /></div>
            {[['Full Name', 'fullName'], ['Email', 'email']].map(([label, key]) => (
              <div className="sap-field-row" key={key}>
                <span className="sap-field-label">{label}:</span>
                <input className="sap-input" style={{ width: 220 }} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="sap-field-row">
              <span className="sap-field-label">Role:</span>
              <select className="sap-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={handleUpdate}>✓ Save</button>
            <button className="sap-btn" onClick={() => { setSelected(null); setTab(0); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
