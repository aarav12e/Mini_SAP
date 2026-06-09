import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function ST22Screen() {
  const { setStatus } = useERP();
  const [dumps, setDumps] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/workbench/dumps'); setDumps(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const ERROR_COLORS = {
    'SYNTAX_ERROR': '#cc0000',
    'RUNTIME_ERROR': '#cc6600',
    'TYPE_CONFLICT': '#9900cc',
    'NO_AUTHORITY': '#003399',
  };

  return (
    <div>
      <div className="sap-screen-header">
        <span>ABAP Runtime Error Analysis &nbsp;[ST22]</span>
      </div>

      <div style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button className="sap-btn primary" onClick={load}>Refresh (F5)</button>
          <span style={{ fontSize: 11, color: '#555', paddingTop: 2 }}>
            Showing last 50 runtime errors
          </span>
        </div>

        {!selected ? (
          <>
            {dumps.length === 0 && !loading && (
              <div className="sap-msg success">✓ No ABAP runtime errors found. System is clean.</div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Error Type</th>
                    <th>Program</th>
                    <th>User</th>
                    <th>Error Text</th>
                    <th>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  ) : dumps.map(dump => (
                    <tr key={dump._id} onClick={() => setSelected(dump)} style={{ cursor: 'pointer' }}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 10 }}>
                        {new Date(dump.errorTime).toLocaleDateString('en-IN')}{' '}
                        {new Date(dump.errorTime).toLocaleTimeString('en-IN', { hour12: false })}
                      </td>
                      <td className="mono bold" style={{ color: ERROR_COLORS[dump.errorType] || '#cc0000' }}>
                        {dump.errorType}
                      </td>
                      <td className="mono">{dump.programName}</td>
                      <td>{dump.user}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dump.errorText}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {dump.resolved ? <span className="green">✓</span> : <span className="red">✕</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Dump Detail View */
          <div>
            <button className="sap-btn" onClick={() => setSelected(null)} style={{ marginBottom: 8 }}>◀ Back to List</button>

            <div style={{ background: '#1a0000', border: '2px solid #cc0000', padding: 12, fontFamily: 'Courier New, monospace', fontSize: 12, color: '#ff8888' }}>
              <div style={{ color: '#ff4444', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                ════════════ ABAP RUNTIME ERROR ════════════
              </div>
              <div style={{ color: '#ffaaaa', marginBottom: 12 }}>
                {new Date(selected.errorTime).toLocaleString('en-IN')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '2px 8px', marginBottom: 12 }}>
                {[
                  ['Error Type', selected.errorType],
                  ['Program', selected.programName],
                  ['Include', selected.includeProgram || selected.programName],
                  ['Line No.', selected.lineNo || 'N/A'],
                  ['User', selected.user],
                ].map(([label, val]) => (
                  <React.Fragment key={label}>
                    <span style={{ color: '#ffaa44' }}>{label}:</span>
                    <span style={{ color: '#ffffff' }}>{val}</span>
                  </React.Fragment>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #660000', paddingTop: 8, marginBottom: 8 }}>
                <div style={{ color: '#ffaa44', marginBottom: 4 }}>Error Description:</div>
                <div style={{ color: '#ffffff', background: '#2a0000', padding: '4px 8px', border: '1px solid #660000' }}>
                  {selected.errorText}
                </div>
              </div>

              {selected.sourceExtract && (
                <div>
                  <div style={{ color: '#ffaa44', marginBottom: 4 }}>Source Code Extract:</div>
                  <div style={{ background: '#0a0a0a', padding: '6px 8px', border: '1px solid #333', whiteSpace: 'pre', overflowX: 'auto', color: '#d4d4d4' }}>
                    {selected.sourceExtract}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 12, borderTop: '1px solid #660000', paddingTop: 8, color: '#aaaaaa', fontSize: 11 }}>
                ═════ How to Fix ══════════════════════════════════
                <br />1. Go to SE38 and open program: {selected.programName}
                <br />2. Check line {selected.lineNo || 'N/A'} for syntax issues
                <br />3. Verify variable declarations with DATA: statement
                <br />4. Ensure START-OF-SELECTION is present for reports
                <br />5. Check WRITE: statements end with period (.)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
