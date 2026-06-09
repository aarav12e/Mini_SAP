import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

const PARAM_TYPES = ['IMPORTING', 'EXPORTING', 'CHANGING', 'TABLES', 'EXCEPTIONS'];
const DATA_TYPES = ['CHAR50', 'CHAR10', 'INT4', 'DEC15_2', 'DATS', 'TIMS', 'NUMC10', 'BOOLEAN', 'STRING'];

const DEFAULT_CODE = `FUNCTION zfunction_name.
*"--------------------------------------------------------------
*"  IMPORTING
*"     VALUE(IV_INPUT) TYPE  CHAR50
*"  EXPORTING
*"     VALUE(EV_OUTPUT) TYPE  CHAR50
*"  EXCEPTIONS
*"     NOT_FOUND = 1
*"     OTHERS    = 2
*"--------------------------------------------------------------

  IF IV_INPUT IS INITIAL.
    RAISE NOT_FOUND.
  ENDIF.

  EV_OUTPUT = IV_INPUT.

ENDFUNCTION.`;

export default function SE37Screen({ tcode }) {
  const { setStatus } = useERP();
  const [functions, setFunctions] = useState([]);
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ functionName: '', functionGroup: '', description: '' });
  const [params, setParams] = useState([
    { paramName: 'IV_INPUT', type: 'IMPORTING', dataType: 'CHAR50', passBy: 'VALUE', optional: false },
    { paramName: 'EV_OUTPUT', type: 'EXPORTING', dataType: 'CHAR50', passBy: 'VALUE', optional: false },
  ]);
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/workbench/functions'); setFunctions(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.functionName) return setStatus('Function name required.', 'error');
    try {
      if (selected?._id) {
        await api.put(`/workbench/functions/${form.functionName}`, { ...form, parameters: params, sourceCode });
      } else {
        await api.post('/workbench/functions', { ...form, parameters: params, sourceCode });
      }
      setStatus(`Function module ${form.functionName} saved.`, 'success');
      setTab(0); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  const loadFM = (fm) => {
    setSelected(fm);
    setForm({ functionName: fm.functionName, functionGroup: fm.functionGroup || '', description: fm.description || '' });
    setParams(fm.parameters || []);
    setSourceCode(fm.sourceCode || DEFAULT_CODE);
    setTab(1);
  };

  const addParam = () => setParams(p => [...p, { paramName: '', type: 'IMPORTING', dataType: 'CHAR50', passBy: 'VALUE', optional: false }]);
  const updateParam = (idx, key, val) => setParams(p => p.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  const removeParam = (idx) => setParams(p => p.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="sap-screen-header">
        <span>Function Builder — {selected ? selected.functionName : '(new)'} &nbsp;[SE37]</span>
      </div>
      <div className="sap-tabs">
        {['Function List', 'Attributes', 'Parameters', 'Source Code'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={() => { setSelected(null); setForm({ functionName: '', functionGroup: '', description: '' }); setParams([{ paramName: 'IV_INPUT', type: 'IMPORTING', dataType: 'CHAR50', passBy: 'VALUE', optional: false }]); setSourceCode(DEFAULT_CODE); setTab(1); }}>
              Create (F5)
            </button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Function Name</th><th>Function Group</th><th>Description</th><th>Parameters</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  : functions.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No function modules. Click "Create".</td></tr>
                  : functions.map(fm => (
                  <tr key={fm._id}>
                    <td className="mono bold">{fm.functionName}</td>
                    <td className="mono">{fm.functionGroup}</td>
                    <td>{fm.description}</td>
                    <td className="num">{fm.parameters?.length || 0}</td>
                    <td><button className="sap-btn" style={{ fontSize: 10 }} onClick={() => loadFM(fm)}>Edit</button></td>
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
            <legend>Function Module Attributes</legend>
            <div className="sap-field-row"><span className="sap-field-label">Function Name:</span>
              <input className="sap-input required mono" style={{ width: 200, textTransform: 'uppercase' }} value={form.functionName}
                onChange={e => setForm(p => ({ ...p, functionName: e.target.value.toUpperCase() }))} placeholder="ZFUNCTION_NAME" />
            </div>
            <div className="sap-field-row"><span className="sap-field-label">Function Group:</span>
              <input className="sap-input mono" style={{ width: 120, textTransform: 'uppercase' }} value={form.functionGroup}
                onChange={e => setForm(p => ({ ...p, functionGroup: e.target.value.toUpperCase() }))} placeholder="ZGROUP" />
            </div>
            <div className="sap-field-row"><span className="sap-field-label">Short Description:</span>
              <input className="sap-input" style={{ width: 280 }} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={handleSave}>💾 Save</button>
            <button className="sap-btn" onClick={() => setTab(2)}>Next: Parameters →</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn" onClick={addParam}>+ Add Parameter</button>
            <div className="sap-sep" />
            {PARAM_TYPES.map(pt => (
              <span key={pt} style={{ fontSize: 10, padding: '2px 6px', background: pt === 'IMPORTING' ? '#e8f4fd' : pt === 'EXPORTING' ? '#e8f5e9' : pt === 'EXCEPTIONS' ? '#fdecea' : '#f5f5f0', border: '1px solid #ccc', cursor: 'pointer' }}
                onClick={() => setParams(p => [...p, { paramName: '', type: pt, dataType: 'CHAR50', passBy: 'VALUE', optional: false }])}>
                + {pt}
              </span>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Parameter Name</th><th>Type</th><th>Data Type</th><th>Pass By</th><th>Optional</th><th></th></tr></thead>
              <tbody>
                {params.map((p, idx) => (
                  <tr key={idx}>
                    <td><input className="sap-input mono" style={{ width: 160, textTransform: 'uppercase' }} value={p.paramName} onChange={e => updateParam(idx, 'paramName', e.target.value.toUpperCase())} /></td>
                    <td>
                      <select className="sap-select" value={p.type} onChange={e => updateParam(idx, 'type', e.target.value)}
                        style={{ background: p.type === 'IMPORTING' ? '#e8f4fd' : p.type === 'EXPORTING' ? '#e8f5e9' : p.type === 'EXCEPTIONS' ? '#fdecea' : '#fff' }}>
                        {PARAM_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="sap-select" value={p.dataType} onChange={e => updateParam(idx, 'dataType', e.target.value)}>
                        {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="sap-select" value={p.passBy} onChange={e => updateParam(idx, 'passBy', e.target.value)}>
                        <option>VALUE</option><option>REFERENCE</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={p.optional} onChange={e => updateParam(idx, 'optional', e.target.checked)} />
                    </td>
                    <td><button className="sap-btn" style={{ fontSize: 10, color: '#cc0000' }} onClick={() => removeParam(idx)}>Del</button></td>
                  </tr>
                ))}
                {params.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 8 }}>No parameters. Click "+ Add Parameter".</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button className="sap-btn primary" onClick={handleSave}>💾 Save</button>
            <button className="sap-btn" onClick={() => setTab(3)}>Next: Source Code →</button>
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <button className="sap-btn primary" onClick={handleSave}>💾 Save (Ctrl+S)</button>
          </div>
          <div style={{ border: '2px solid #808080', background: '#1e1e1e' }}>
            <div style={{ background: '#333', color: '#ccc', fontSize: 10, padding: '2px 6px' }}>
              ABAP Source — {form.functionName || 'FUNCTION'}
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ background: '#2a2a2a', color: '#555', fontFamily: 'Courier New, monospace', fontSize: 12, padding: '4px 6px', textAlign: 'right', userSelect: 'none', minWidth: 36, lineHeight: '18px', borderRight: '1px solid #444' }}>
                {sourceCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Courier New, monospace', fontSize: 12, padding: '4px 6px', border: 'none', outline: 'none', resize: 'none', lineHeight: '18px', minHeight: 340, width: '100%' }}
                value={sourceCode}
                onChange={e => setSourceCode(e.target.value)}
                spellCheck={false}
                wrap="off"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
