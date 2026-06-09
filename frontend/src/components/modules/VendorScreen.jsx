import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function VendorScreen({ tcode }) {
  const { setStatus } = useERP();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', gstin: '', pan: '', phone: '', email: '', bankAccount: '', ifsc: '', paymentTerms: 'NET30' });

  const load = async () => { setLoading(true); try { const r = await api.get('/vendors'); setVendors(r.data); } catch { setStatus('Load failed', 'error'); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      if (selected?._id) await api.put(`/vendors/${selected.vendorNo}`, form);
      else await api.post('/vendors', form);
      setStatus('Vendor saved.', 'success'); setShowForm(false); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Vendor Master Data &nbsp;[{tcode}]</span></div>
      <div className="p8">
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button className="sap-btn primary" onClick={() => { setSelected(null); setForm({ name: '', address: '', city: '', state: '', gstin: '', pan: '', phone: '', email: '', bankAccount: '', ifsc: '', paymentTerms: 'NET30' }); setShowForm(true); }}>Create Vendor (XK01)</button>
          <button className="sap-btn" onClick={load}>Refresh</button>
        </div>
        {showForm && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>{selected ? `Edit: ${selected.vendorNo}` : 'New Vendor'}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[['Vendor Name', 'name', true], ['Address', 'address'], ['City', 'city'], ['State', 'state'], ['GSTIN', 'gstin'], ['PAN', 'pan'], ['Phone', 'phone'], ['Email', 'email'], ['Bank Account', 'bankAccount'], ['IFSC Code', 'ifsc'], ['Payment Terms', 'paymentTerms']].map(([label, key, req]) => (
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
            <thead><tr><th>Vendor No.</th><th>Name</th><th>City</th><th>GSTIN</th><th>IFSC</th><th>Terms</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                : vendors.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No vendors. Create one above.</td></tr>
                : vendors.map(v => (
                <tr key={v._id} className={selected?._id === v._id ? 'selected' : ''} onClick={() => { setSelected(v); setForm(v); setShowForm(true); }}>
                  <td className="mono">{v.vendorNo}</td><td>{v.name}</td><td>{v.city}</td><td className="mono">{v.gstin}</td>
                  <td className="mono">{v.ifsc}</td><td>{v.paymentTerms}</td>
                  <td className={v.status === 'Active' ? 'green' : 'red'}>{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
