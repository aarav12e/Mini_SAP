// SM50Screen.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export function SM50Screen() {
  const [processes, setProcesses] = useState([]);
  const [serverInfo, setServerInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/jobs/system/processes'); setProcesses(r.data.processes || []); setServerInfo(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, []);

  const WP_COLORS = { DIA: '#003399', UPD: '#006600', BGD: '#7a5000', ENQ: '#9900cc', SPO: '#555' };

  return (
    <div>
      <div className="sap-screen-header">
        <span>Work Process Overview &nbsp;[SM50]</span>
        <span style={{ fontSize: 10 }}>Server: {serverInfo.serverName} | Instance: {serverInfo.instance} | Auto-refresh: 3s</span>
      </div>
      <div style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button className="sap-btn primary" onClick={load}>Refresh (F5)</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sap-table">
            <thead><tr><th>WP</th><th>Type</th><th>PID</th><th>Status</th><th>Action</th><th>Client</th><th>User</th><th>Program</th><th>Table</th></tr></thead>
            <tbody>
              {loading && processes.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                : processes.map((p, i) => (
                <tr key={i}>
                  <td className="num">{p.wp}</td>
                  <td className="mono bold" style={{ color: WP_COLORS[p.type] || '#000' }}>{p.type}</td>
                  <td className="mono">{p.pid}</td>
                  <td className={p.status === 'Running' ? 'green' : ''}>{p.status}</td>
                  <td>{p.action}</td>
                  <td>{p.client}</td>
                  <td className="mono">{p.user}</td>
                  <td className="mono" style={{ fontSize: 10 }}>{p.program}</td>
                  <td className="mono">{p.table}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: '#555', display: 'flex', gap: 16 }}>
          {Object.entries(WP_COLORS).map(([type, color]) => (
            <span key={type}><span style={{ color, fontWeight: 'bold', fontFamily: 'Courier New' }}>{type}</span> — {type === 'DIA' ? 'Dialog' : type === 'UPD' ? 'Update' : type === 'BGD' ? 'Background' : type === 'ENQ' ? 'Enqueue' : 'Spool'}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SM50Screen;
