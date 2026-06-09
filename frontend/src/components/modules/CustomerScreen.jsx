// CustomerScreen
import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export function CustomerScreen({ tcode }) {
  const { setStatus } = useERP();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', gstin: '', pan: '', phone: '', email: '', creditLimit: '', paymentTerms: 'NET30' });

  const load = async () => { setLoading(true); try { const r = await api.get('/customers'); setCustomers(r.data); } catch { setStatus('Load failed', 'error'); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (selected?._id) await api.put(`/customers/${selected.customerNo}`, form);
      else await api.post('/customers', form);
      setStatus('Customer saved.', 'success'); setShowForm(false); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Customer Master Data &nbsp;[{tcode}]</span></div>
      <div className="p8">
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button className="sap-btn primary" onClick={() => { setSelected(null); setForm({ name: '', address: '', city: '', state: '', gstin: '', pan: '', phone: '', email: '', creditLimit: '', paymentTerms: 'NET30' }); setShowForm(true); }}>Create Customer (XD01)</button>
          <button className="sap-btn" onClick={load}>Refresh</button>
        </div>
        {showForm && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>{selected ? `Edit: ${selected.customerNo}` : 'New Customer'}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[['Company Name', 'name', true], ['Address', 'address'], ['City', 'city'], ['State', 'state'], ['GSTIN', 'gstin'], ['PAN', 'pan'], ['Phone', 'phone'], ['Email', 'email'], ['Credit Limit', 'creditLimit'], ['Payment Terms', 'paymentTerms']].map(([label, key, req]) => (
                <div className="sap-field-row" key={key}>
                  <span className="sap-field-label" style={{ width: 120 }}>{label}:</span>
                  <input className={`sap-input${req ? ' required' : ''}`} style={{ width: 180 }} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 126 }}>
              <button className="sap-btn primary" onClick={handleSave}>✓ Save</button>
              <button className="sap-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="sap-table">
            <thead><tr><th>Customer No.</th><th>Name</th><th>City</th><th>GSTIN</th><th>Credit Limit</th><th>Terms</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                : customers.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No customers. Create one above.</td></tr>
                : customers.map(c => (
                <tr key={c._id} className={selected?._id === c._id ? 'selected' : ''} onClick={() => { setSelected(c); setForm(c); setShowForm(true); }}>
                  <td className="mono">{c.customerNo}</td><td>{c.name}</td><td>{c.city}</td><td className="mono">{c.gstin}</td>
                  <td className="num">₹{(c.creditLimit || 0).toLocaleString('en-IN')}</td><td>{c.paymentTerms}</td>
                  <td className={c.status === 'Active' ? 'green' : 'red'}>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CustomerScreen;
