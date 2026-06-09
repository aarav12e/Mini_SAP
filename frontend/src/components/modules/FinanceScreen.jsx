import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function FinanceScreen({ tcode }) {
  const { setStatus } = useERP();
  const [tab, setTab] = useState(0);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [header, setHeader] = useState({ documentType: 'SA', documentDate: today(), postingDate: today(), currency: 'INR', reference: '', headerText: '' });
  const [lineItems, setLineItems] = useState([
    { itemNo: '001', glAccount: '', description: '', debitCredit: 'Debit', amount: '', costCenter: '' },
    { itemNo: '002', glAccount: '', description: '', debitCredit: 'Credit', amount: '', costCenter: '' },
  ]);

  function today() { return new Date().toISOString().split('T')[0]; }

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/finance'); setDocs(res.data); } catch { setStatus('Failed to load GL documents', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalDebit = lineItems.filter(i => i.debitCredit === 'Debit').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalCredit = lineItems.filter(i => i.debitCredit === 'Credit').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const addLine = () => setLineItems(p => [...p, { itemNo: String(p.length + 1).padStart(3, '0'), glAccount: '', description: '', debitCredit: 'Debit', amount: '', costCenter: '' }]);
  const updateLine = (idx, key, val) => setLineItems(p => p.map((item, i) => i === idx ? { ...item, [key]: val } : item));
  const removeLine = (idx) => setLineItems(p => p.filter((_, i) => i !== idx));

  const handleSave = async (post = false) => {
    try {
      const payload = { ...header, lineItems: lineItems.map(i => ({ ...i, amount: parseFloat(i.amount) || 0 })), status: post ? 'Posted' : 'Draft' };
      if (selected) {
        await api.put(`/finance/${selected.documentNo}`, payload);
      } else {
        await api.post('/finance', payload);
      }
      setStatus(post ? `Document posted successfully. ${isBalanced ? '' : 'WARNING: Not balanced!'}` : 'Document saved as draft.', post && isBalanced ? 'success' : 'warning');
      setShowForm(false);
      load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error saving document', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Finance — GL Document Posting &nbsp;[{tcode}]</span></div>
      <div className="sap-tabs">
        {['Document List', 'Post Document (FB01)', 'Vendor Ledger (FBL1N)'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={() => { setSelected(null); setShowForm(true); setTab(1); }}>New Entry (F5)</button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Doc No.</th><th>Type</th><th>Doc Date</th><th>Posting Date</th><th>Reference</th><th>Debit</th><th>Credit</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  : docs.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No GL documents. Click "New Entry" to post.</td></tr>
                  : docs.map(doc => (
                  <tr key={doc._id} className={selected?._id === doc._id ? 'selected' : ''} onClick={() => setSelected(doc)}>
                    <td className="mono">{doc.documentNo}</td>
                    <td>{doc.documentType}</td>
                    <td>{new Date(doc.documentDate).toLocaleDateString('en-IN')}</td>
                    <td>{new Date(doc.postingDate).toLocaleDateString('en-IN')}</td>
                    <td>{doc.reference}</td>
                    <td className="num">₹{(doc.totalDebit || 0).toLocaleString('en-IN')}</td>
                    <td className="num">₹{(doc.totalCredit || 0).toLocaleString('en-IN')}</td>
                    <td className={doc.status === 'Posted' ? 'green' : doc.status === 'Reversed' ? 'red' : ''}>{doc.status}</td>
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
            <legend>Document Header</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div className="sap-field-row"><span className="sap-field-label">Document Date:</span><input type="date" className="sap-input required" value={header.documentDate} onChange={e => setHeader(p => ({ ...p, documentDate: e.target.value }))} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Posting Date:</span><input type="date" className="sap-input required" value={header.postingDate} onChange={e => setHeader(p => ({ ...p, postingDate: e.target.value }))} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Document Type:</span>
                <select className="sap-select" value={header.documentType} onChange={e => setHeader(p => ({ ...p, documentType: e.target.value }))}>
                  {['SA', 'KR', 'DR', 'KZ', 'DZ'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sap-field-row"><span className="sap-field-label">Currency:</span><input className="sap-input" style={{ width: 60 }} value={header.currency} onChange={e => setHeader(p => ({ ...p, currency: e.target.value.toUpperCase() }))} maxLength={3} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Reference:</span><input className="sap-input" style={{ width: 220 }} value={header.reference} onChange={e => setHeader(p => ({ ...p, reference: e.target.value }))} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Header Text:</span><input className="sap-input" style={{ width: 220 }} value={header.headerText} onChange={e => setHeader(p => ({ ...p, headerText: e.target.value }))} /></div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>Line Items</div>
          <table className="sap-table" style={{ marginBottom: 6 }}>
            <thead><tr><th>Itm</th><th>GL Account</th><th>D/C</th><th>Description</th><th>Amount (INR)</th><th>Cost Ctr</th><th></th></tr></thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.itemNo}</td>
                  <td><input className="sap-input mono" style={{ width: 80 }} value={item.glAccount} onChange={e => updateLine(idx, 'glAccount', e.target.value)} placeholder="e.g. 630000" /></td>
                  <td>
                    <select className="sap-select" value={item.debitCredit} onChange={e => updateLine(idx, 'debitCredit', e.target.value)}>
                      <option>Debit</option><option>Credit</option>
                    </select>
                  </td>
                  <td><input className="sap-input" style={{ width: 160 }} value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} /></td>
                  <td><input className="sap-input mono" style={{ width: 100, textAlign: 'right' }} value={item.amount} onChange={e => updateLine(idx, 'amount', e.target.value)} /></td>
                  <td><input className="sap-input" style={{ width: 80 }} value={item.costCenter} onChange={e => updateLine(idx, 'costCenter', e.target.value)} /></td>
                  <td><button className="sap-btn" style={{ color: '#cc0000', fontSize: 10 }} onClick={() => removeLine(idx)}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button className="sap-btn" onClick={addLine}>+ Add Line</button>
            <div style={{ fontSize: 11, fontWeight: 'bold' }}>
              <span>Debit: ₹{totalDebit.toLocaleString('en-IN')}</span>
              &nbsp;|&nbsp;
              <span>Credit: ₹{totalCredit.toLocaleString('en-IN')}</span>
              &nbsp;|&nbsp;
              <span className={isBalanced ? 'green' : 'red'}>
                {isBalanced ? '✓ Balanced' : `✕ Difference: ₹${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={() => handleSave(true)} disabled={!isBalanced}>Post Document (F11)</button>
            <button className="sap-btn" onClick={() => handleSave(false)}>Save Draft</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div className="sap-msg info">ℹ Vendor Ledger (FBL1N) — Shows all posted vendor documents.</div>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="sap-table">
              <thead><tr><th>Doc No.</th><th>Type</th><th>Posting Date</th><th>Ref.</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {docs.filter(d => d.documentType === 'KR').map(doc => (
                  <tr key={doc._id}>
                    <td className="mono">{doc.documentNo}</td>
                    <td>{doc.documentType}</td>
                    <td>{new Date(doc.postingDate).toLocaleDateString('en-IN')}</td>
                    <td>{doc.reference}</td>
                    <td className="num">₹{(doc.totalDebit || 0).toLocaleString('en-IN')}</td>
                    <td className={doc.status === 'Posted' ? 'green' : ''}>{doc.status}</td>
                  </tr>
                ))}
                {docs.filter(d => d.documentType === 'KR').length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No vendor documents. Post with type KR.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
