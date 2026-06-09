import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

const DATA_TYPES = ['CHAR', 'NUMC', 'DATS', 'TIMS', 'DEC', 'INT4', 'CURR', 'CLNT', 'MANDT', 'QUAN', 'FLTP', 'STRG'];
const DELIVER_CLASSES = ['A', 'C', 'L', 'G', 'E', 'S', 'W'];

export default function SE11Screen({ tcode }) {
  const { setStatus } = useERP();
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [form, setForm] = useState({ tableName: '', description: '', tableType: 'TRANSP', deliveryClass: 'A', package: '$TMP' });
  const [fields, setFields] = useState([
    { fieldName: 'MANDT', dataElement: 'MANDT', dataType: 'CLNT', length: 3, decimals: 0, isKey: true, description: 'Client' },
    { fieldName: '', dataElement: '', dataType: 'CHAR', length: 10, decimals: 0, isKey: false, description: '' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/workbench/tables'); setTables(r.data); } catch { setStatus('Load failed', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleActivate = async (tableName) => {
    try { await api.post(`/workbench/tables/${tableName}/activate`); setStatus(`Table ${tableName} activated.`, 'success'); load(); } catch (e) { setStatus('Activation failed', 'error'); }
  };

  const addField = () => setFields(p => [...p, { fieldName: '', dataElement: '', dataType: 'CHAR', length: 10, decimals: 0, isKey: false, description: '' }]);
  const updateField = (idx, key, val) => setFields(p => p.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  const removeField = (idx) => setFields(p => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.tableName) return setStatus('Table name is required.', 'error');
    try {
      await api.post('/workbench/tables', { ...form, fields });
      setStatus(`Table ${form.tableName} created successfully.`, 'success');
      setShowCreate(false); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error creating table', 'error'); }
  };

  const filtered = tables.filter(t => t.tableName.includes(searchName.toUpperCase()) || t.description?.toLowerCase().includes(searchName.toLowerCase()));

  return (
    <div>
      <div className="sap-screen-header"><span>ABAP Dictionary: Initial Screen &nbsp;[SE11]</span></div>
      <div className="sap-tabs">
        {['Dictionary Objects', 'Create Table', 'Field Reference'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div className="sap-fieldset">
            <legend>Object Selection</legend>
            <div className="sap-field-row">
              <span className="sap-field-label">Database Table:</span>
              <input className="sap-input required mono" style={{ width: 160, textTransform: 'uppercase' }} value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Table name or *" />
              <button className="sap-btn" style={{ marginLeft: 4 }} onClick={load}>Display (F7)</button>
              <button className="sap-btn primary" style={{ marginLeft: 4 }} onClick={() => { setTab(1); }}>Create (F5)</button>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Dictionary Objects — {filtered.length} table(s)</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Table Name</th><th>Description</th><th>Type</th><th>Del. Class</th><th>Package</th><th>Status</th><th>Fields</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No tables. Click "Create" to define a new table.</td></tr>
                  : filtered.map(t => (
                  <tr key={t._id} className={selected?._id === t._id ? 'selected' : ''} onClick={() => setSelected(t)}>
                    <td className="mono bold">{t.tableName}</td>
                    <td>{t.description}</td>
                    <td>{t.tableType}</td>
                    <td>{t.deliveryClass}</td>
                    <td className="mono">{t.package}</td>
                    <td className={t.status === 'Active' ? 'green' : t.status === 'Modified' ? '' : 'red'}>{t.status}</td>
                    <td className="num">{t.fields?.length || 0}</td>
                    <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      {t.status !== 'Active' && <button className="sap-btn primary" style={{ fontSize: 10, marginRight: 2 }} onClick={() => handleActivate(t.tableName)}>Activate</button>}
                      <button className="sap-btn" style={{ fontSize: 10 }} onClick={() => { setSelected(t); setForm(t); setFields(t.fields || []); setTab(1); }}>Edit</button>
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
            <legend>Table Definition</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div className="sap-field-row"><span className="sap-field-label">Table Name:</span><input className="sap-input required mono" style={{ width: 160, textTransform: 'uppercase' }} value={form.tableName} onChange={e => setForm(p => ({ ...p, tableName: e.target.value.toUpperCase() }))} placeholder="ZZTABLE" /></div>
              <div className="sap-field-row"><span className="sap-field-label">Short Description:</span><input className="sap-input required" style={{ width: 240 }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Table Type:</span>
                <select className="sap-select" value={form.tableType} onChange={e => setForm(p => ({ ...p, tableType: e.target.value }))}>
                  {['TRANSP', 'POOL', 'CLUSTER', 'VIEW'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sap-field-row"><span className="sap-field-label">Delivery Class:</span>
                <select className="sap-select" value={form.deliveryClass} onChange={e => setForm(p => ({ ...p, deliveryClass: e.target.value }))}>
                  {DELIVER_CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sap-field-row"><span className="sap-field-label">Package:</span><input className="sap-input mono" style={{ width: 100, textTransform: 'uppercase' }} value={form.package} onChange={e => setForm(p => ({ ...p, package: e.target.value.toUpperCase() }))} /></div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Fields</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table" style={{ marginBottom: 6 }}>
              <thead><tr><th>Key</th><th>Field Name</th><th>Data Element</th><th>Data Type</th><th>Length</th><th>Dec.</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {fields.map((f, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={f.isKey} onChange={e => updateField(idx, 'isKey', e.target.checked)} />
                    </td>
                    <td><input className="sap-input mono" style={{ width: 100, textTransform: 'uppercase' }} value={f.fieldName} onChange={e => updateField(idx, 'fieldName', e.target.value.toUpperCase())} /></td>
                    <td><input className="sap-input mono" style={{ width: 100 }} value={f.dataElement} onChange={e => updateField(idx, 'dataElement', e.target.value.toUpperCase())} /></td>
                    <td>
                      <select className="sap-select" value={f.dataType} onChange={e => updateField(idx, 'dataType', e.target.value)}>
                        {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td><input className="sap-input mono" style={{ width: 50, textAlign: 'right' }} value={f.length} onChange={e => updateField(idx, 'length', parseInt(e.target.value) || 0)} /></td>
                    <td><input className="sap-input mono" style={{ width: 40, textAlign: 'right' }} value={f.decimals} onChange={e => updateField(idx, 'decimals', parseInt(e.target.value) || 0)} /></td>
                    <td><input className="sap-input" style={{ width: 160 }} value={f.description} onChange={e => updateField(idx, 'description', e.target.value)} /></td>
                    <td><button className="sap-btn" style={{ fontSize: 10, color: '#cc0000' }} onClick={() => removeField(idx)} disabled={f.fieldName === 'MANDT'}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <button className="sap-btn" onClick={addField}>+ Append Field</button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={handleSave}>✓ Save &amp; Create (Ctrl+S)</button>
            <button className="sap-btn" onClick={() => { handleSave().then(() => handleActivate(form.tableName)); }}>⚡ Save &amp; Activate (Ctrl+F3)</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>ABAP Data Type Reference</div>
          <table className="sap-table">
            <thead><tr><th>Type</th><th>Description</th><th>Example Length</th><th>Use Case</th></tr></thead>
            <tbody>
              {[
                ['CHAR', 'Character string', '1–255', 'Names, codes, text fields'],
                ['NUMC', 'Numeric character (no math)', '1–255', 'Document numbers, order IDs'],
                ['DATS', 'Date', '8 (fixed)', 'Dates in YYYYMMDD format'],
                ['TIMS', 'Time', '6 (fixed)', 'Time in HHMMSS format'],
                ['DEC', 'Decimal number', '1–31', 'Amounts, prices, quantities'],
                ['INT4', 'Integer (4 byte)', '10 (fixed)', 'Counters, line numbers'],
                ['CURR', 'Currency amount', '1–31', 'Financial values (with CUKY ref)'],
                ['CLNT', 'Client field', '3 (fixed)', 'Always first key field'],
                ['MANDT', 'Mandant/Client', '3 (fixed)', 'Alias for CLNT in standard SAP'],
                ['QUAN', 'Quantity', '1–31', 'Stock quantities (with UNIT ref)'],
                ['FLTP', 'Float (8 byte)', '16 (fixed)', 'Scientific calculations'],
                ['STRG', 'String (unlimited)', 'Variable', 'Long text, descriptions'],
              ].map(([type, desc, len, use]) => (
                <tr key={type}><td className="mono bold">{type}</td><td>{desc}</td><td>{len}</td><td>{use}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
