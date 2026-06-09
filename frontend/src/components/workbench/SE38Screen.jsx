import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

const STARTER_CODE = `REPORT zprogramname.

*----------------------------------------------------------------------*
* Mini SAP ERP - ABAP Program
* Author: [Your Name]
* Date  : ${new Date().toISOString().slice(0, 10)}
*----------------------------------------------------------------------*

DATA: lv_text    TYPE char50,
      lv_counter TYPE int4.

START-OF-SELECTION.

  lv_text = 'Hello from Mini SAP ERP!'.
  lv_counter = 1.

  WRITE: / '============================================'.
  WRITE: / 'Program Output'.
  WRITE: / '============================================'.
  SKIP.
  WRITE: / 'Message:', lv_text.
  WRITE: / 'Counter:', lv_counter.
  SKIP.
  WRITE: / 'Execution completed successfully.'.
`;

export default function SE38Screen({ tcode }) {
  const { setStatus } = useERP();
  const [programs, setPrograms] = useState([]);
  const [tab, setTab] = useState(0);
  const [progName, setProgName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState([]);
  const [outputError, setOutputError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/workbench/programs'); setPrograms(r.data); } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!progName) return setStatus('Program name required.', 'error');
    try {
      await api.put(`/workbench/programs/${progName.toUpperCase()}`, { programName: progName.toUpperCase(), description, sourceCode: code, programType: '1-Report' });
      setStatus(`Program ${progName.toUpperCase()} saved.`, 'success');
      load();
    } catch (e) { setStatus('Save failed', 'error'); }
  };

  const handleExecute = async () => {
    if (!progName) return setStatus('Save the program first.', 'error');
    setExecuting(true);
    setOutput([]);
    try {
      const res = await api.post(`/workbench/programs/${progName.toUpperCase()}/execute`);
      if (res.data.success) {
        setOutput(res.data.output);
        setOutputError(false);
        setStatus(`Program ${progName.toUpperCase()} executed. ${res.data.output.length} line(s) output.`, 'success');
      } else {
        setOutput([`ABAP DUMP: ${res.data.error}`, `Dump ID: ${res.data.dumpId}`, `Check ST22 for details.`]);
        setOutputError(true);
        setStatus(`Runtime error in ${progName}. Check ST22.`, 'error');
      }
    } catch (e) { setStatus('Execution failed', 'error'); }
    setExecuting(false);
  };

  const loadProgram = (prog) => {
    setProgName(prog.programName);
    setDescription(prog.description || '');
    setCode(prog.sourceCode || STARTER_CODE);
    setOutput([]);
    setTab(1);
  };

  const handleNew = () => {
    setProgName('');
    setDescription('');
    setCode(STARTER_CODE);
    setOutput([]);
    setTab(1);
  };

  return (
    <div>
      <div className="sap-screen-header"><span>ABAP Editor — {tcode === 'SE24' ? 'Class Builder [SE24]' : `Program: ${progName || '(new)'} [SE38]`}</span></div>
      <div className="sap-tabs">
        {['Program List', 'Source Code Editor', 'Output Spool'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={handleNew}>Create Program (F5)</button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Program Name</th><th>Description</th><th>Type</th><th>Package</th><th>Last Modified</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  : programs.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No programs. Click "Create Program".</td></tr>
                  : programs.map(p => (
                  <tr key={p._id}>
                    <td className="mono bold">{p.programName}</td>
                    <td>{p.description}</td>
                    <td>{p.programType}</td>
                    <td className="mono">{p.package}</td>
                    <td>{new Date(p.updatedAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="sap-btn" style={{ fontSize: 10, marginRight: 2 }} onClick={() => loadProgram(p)}>Edit (SE38)</button>
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
          <div className="sap-fieldset" style={{ marginBottom: 6 }}>
            <legend>Program Attributes</legend>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="sap-field-row">
                <span className="sap-field-label" style={{ width: 110 }}>Program Name:</span>
                <input className="sap-input required mono" style={{ width: 160, textTransform: 'uppercase' }} value={progName} onChange={e => setProgName(e.target.value.toUpperCase())} placeholder="ZPROGRAMNAME" />
              </div>
              <div className="sap-field-row">
                <span className="sap-field-label" style={{ width: 80 }}>Description:</span>
                <input className="sap-input" style={{ width: 220 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <button className="sap-btn" onClick={handleSave}>💾 Save (Ctrl+S)</button>
            <button className="sap-btn primary" onClick={async () => { await handleSave(); handleExecute(); }}>▶ Execute (F8)</button>
            {executing && <span style={{ fontSize: 11, color: '#003399', paddingTop: 2 }}>Executing...</span>}
          </div>

          {/* ABAP Code editor - plain textarea styled like ABAP editor */}
          <div style={{ border: '2px solid #808080', background: '#1e1e1e', marginBottom: 4 }}>
            <div style={{ background: '#333', color: '#ccc', fontSize: 10, padding: '2px 6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>ABAP Source Code — {progName || 'Untitled'}</span>
              <span>Lines: {code.split('\n').length}</span>
            </div>
            <div style={{ display: 'flex' }}>
              {/* Line numbers */}
              <div style={{ background: '#2a2a2a', color: '#555', fontFamily: 'Courier New, monospace', fontSize: 12, padding: '4px 6px', textAlign: 'right', userSelect: 'none', minWidth: 36, lineHeight: '18px', borderRight: '1px solid #444' }}>
                {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'Courier New, monospace', fontSize: 12, padding: '4px 6px', border: 'none', outline: 'none', resize: 'none', lineHeight: '18px', minHeight: 320, width: '100%' }}
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                wrap="off"
              />
            </div>
          </div>

          {/* Syntax hints */}
          <div style={{ fontSize: 10, color: '#555', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>ABAP Keywords: <span style={{ fontFamily: 'Courier New', color: '#003399' }}>REPORT, DATA, START-OF-SELECTION, WRITE, SKIP, ULINE, MESSAGE, IF, ENDIF, LOOP, ENDLOOP</span></span>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
            Spool Output — {progName || '(no program)'} {outputError && <span className="red">[ABAP DUMP]</span>}
          </div>
          {output.length === 0 ? (
            <div className="sap-msg info">ℹ No output yet. Write a program and click "Execute (F8)".</div>
          ) : (
            <div style={{ background: outputError ? '#1a0000' : '#000', color: outputError ? '#ff4444' : '#00ff00', fontFamily: 'Courier New, monospace', fontSize: 12, padding: 10, minHeight: 200, whiteSpace: 'pre-wrap', border: '1px solid #333' }}>
              {output.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
