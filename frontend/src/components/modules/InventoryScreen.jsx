// InventoryScreen.jsx
import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export function InventoryScreen({ tcode }) {
  const { setStatus } = useERP();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', materialType: 'RAW', uom: 'EA', unrestricted: 0, reorderPoint: 0, price: 0 });
  const [mvtType, setMvtType] = useState('issue');
  const [mvtQty, setMvtQty] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/inventory', { params: { search } }); setMaterials(res.data); } catch { setStatus('Load failed', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const handleSave = async () => {
    try {
      if (selected?._id) await api.put(`/inventory/${selected.materialNo}`, form);
      else await api.post('/inventory', form);
      setStatus('Material saved.', 'success');
      setShowForm(false); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  const handleMovement = async () => {
    if (!selected || !mvtQty) return;
    try {
      const endpoint = mvtType === 'issue' ? 'goods-issue' : 'goods-receipt';
      const res = await api.post(`/inventory/${selected.materialNo}/${endpoint}`, { quantity: parseFloat(mvtQty) });
      setStatus(res.data.message, 'success');
      load();
    } catch (e) { setStatus(e.response?.data?.message || 'Movement failed', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Inventory — Stock Overview &nbsp;[{tcode}]</span></div>
      <div style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button className="sap-btn primary" onClick={() => { setSelected(null); setForm({ description: '', materialType: 'RAW', uom: 'EA', unrestricted: 0, reorderPoint: 0, price: 0 }); setShowForm(true); }}>New Material (MM01)</button>
          <button className="sap-btn" onClick={load}>Refresh</button>
          <input className="sap-input" style={{ width: 180 }} placeholder="Search material / desc." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>{selected ? `Edit: ${selected.materialNo}` : 'Create Material (MM01)'}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[['Description', 'description', true], ['UoM', 'uom'], ['Price (INR)', 'price'], ['Unrestricted Stock', 'unrestricted'], ['Reorder Point', 'reorderPoint']].map(([label, key, req]) => (
                <div className="sap-field-row" key={key}>
                  <span className="sap-field-label" style={{ width: 140 }}>{label}:</span>
                  <input className={`sap-input${req ? ' required' : ''}`} style={{ width: 160 }} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="sap-field-row">
                <span className="sap-field-label" style={{ width: 140 }}>Material Type:</span>
                <select className="sap-select" value={form.materialType} onChange={e => setForm(p => ({ ...p, materialType: e.target.value }))}>
                  {['RAW', 'FG', 'SFG', 'SPARE', 'SERVICE'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 146 }}>
              <button className="sap-btn primary" onClick={handleSave}>✓ Save</button>
              <button className="sap-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {selected && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>Goods Movement — {selected.materialNo}</legend>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select className="sap-select" value={mvtType} onChange={e => setMvtType(e.target.value)}>
                <option value="issue">MB1A — Goods Issue</option>
                <option value="receipt">MB1C — Goods Receipt</option>
              </select>
              <input className="sap-input mono" style={{ width: 80 }} placeholder="Qty" value={mvtQty} onChange={e => setMvtQty(e.target.value)} />
              <span style={{ fontSize: 11 }}>{selected.uom}</span>
              <button className="sap-btn primary" onClick={handleMovement}>Post Movement</button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="sap-table">
            <thead><tr><th>Material No.</th><th>Description</th><th>Type</th><th>UoM</th><th>Unrestricted</th><th>Reserved</th><th>Reorder Pt</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                : materials.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No materials. Click "New Material".</td></tr>
                : materials.map(mat => {
                const isBelowReorder = mat.unrestricted < mat.reorderPoint;
                return (
                  <tr key={mat._id} className={selected?._id === mat._id ? 'selected' : ''} onClick={() => setSelected(mat)}>
                    <td className={`mono${isBelowReorder ? ' red' : ''}`}>{mat.materialNo}</td>
                    <td className={isBelowReorder ? 'red' : ''}>{mat.description}</td>
                    <td>{mat.materialType}</td>
                    <td>{mat.uom}</td>
                    <td className={`num${isBelowReorder ? ' red' : ''}`}>{mat.unrestricted?.toLocaleString('en-IN')}</td>
                    <td className="num">{mat.reserved?.toLocaleString('en-IN')}</td>
                    <td className="num">{mat.reorderPoint?.toLocaleString('en-IN')}</td>
                    <td className="num">₹{mat.price?.toLocaleString('en-IN')}</td>
                    <td className={isBelowReorder ? 'red' : 'green'}>{isBelowReorder ? '⚠ Low Stock' : 'OK'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {materials.some(m => m.unrestricted < m.reorderPoint) && (
          <div style={{ fontSize: 10, color: '#cc0000', paddingTop: 4 }}>⚠ Items in red are below reorder point.</div>
        )}
      </div>
    </div>
  );
}

export default InventoryScreen;
