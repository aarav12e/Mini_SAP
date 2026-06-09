import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function SM37Screen() {
  const { setStatus } = useERP();
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ jobName: '', programName: '', scheduledAt: '' });
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/jobs', { params: { status: filterStatus || undefined } });
      setJobs(r.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleSchedule = async () => {
    if (!form.jobName || !form.programName) return setStatus('Job name and program required.', 'error');
    try {
      const res = await api.post('/jobs', form);
      setStatus(res.data.message, 'success');
      setShowCreate(false);
      setForm({ jobName: '', programName: '', scheduledAt: '' });
      load();
    } catch (e) { setStatus('Schedule failed', 'error'); }
  };

  const handleCancel = async (id) => {
    try { await api.post(`/jobs/${id}/cancel`); setStatus('Job cancelled.', 'success'); load(); } catch {}
  };

  const STATUS_COLORS = {
    'Scheduled': '#003399',
    'Running': '#006600',
    'Finished': '#006600',
    'Cancelled': '#808080',
    'Error': '#cc0000',
  };

  const STATUS_ICONS = {
    'Scheduled': '⏰',
    'Running': '▶',
    'Finished': '✓',
    'Cancelled': '✕',
    'Error': '✕',
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Job Overview &nbsp;[SM37]</span></div>

      <div style={{ padding: 8 }}>
        {/* Selection criteria */}
        <div className="sap-fieldset" style={{ marginBottom: 8 }}>
          <legend>Selection Criteria</legend>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sap-field-row">
              <span className="sap-field-label" style={{ width: 80 }}>Job Status:</span>
              <select className="sap-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                {['Scheduled', 'Running', 'Finished', 'Cancelled', 'Error'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="sap-btn primary" onClick={load}>Execute (F8)</button>
            <button className="sap-btn" onClick={() => setShowCreate(true)}>Schedule Job</button>
            <span style={{ fontSize: 10, color: '#555' }}>Auto-refresh: 5s</span>
          </div>
        </div>

        {showCreate && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>Schedule Background Job</legend>
            <div className="sap-field-row"><span className="sap-field-label">Job Name:</span>
              <input className="sap-input required" style={{ width: 200 }} value={form.jobName} onChange={e => setForm(p => ({ ...p, jobName: e.target.value.toUpperCase() }))} placeholder="JOB_NAME" />
            </div>
            <div className="sap-field-row"><span className="sap-field-label">Program Name:</span>
              <input className="sap-input required mono" style={{ width: 200 }} value={form.programName} onChange={e => setForm(p => ({ ...p, programName: e.target.value.toUpperCase() }))} placeholder="ZPROGRAMNAME" />
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 166 }}>
              <button className="sap-btn primary" onClick={handleSchedule}>Schedule Now</button>
              <button className="sap-btn" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Job Name</th>
                <th>Program</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && jobs.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No jobs found. Click "Schedule Job".</td></tr>
              ) : jobs.map(job => (
                <tr key={job._id} className={selected?._id === job._id ? 'selected' : ''} onClick={() => setSelected(job)}>
                  <td className="bold">{job.jobName}</td>
                  <td className="mono">{job.programName}</td>
                  <td style={{ color: STATUS_COLORS[job.status], fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {STATUS_ICONS[job.status]} {job.status}
                  </td>
                  <td style={{ fontSize: 10 }}>{job.scheduledAt ? new Date(job.scheduledAt).toLocaleTimeString('en-IN', { hour12: false }) : '-'}</td>
                  <td style={{ fontSize: 10 }}>{job.startedAt ? new Date(job.startedAt).toLocaleTimeString('en-IN', { hour12: false }) : '-'}</td>
                  <td style={{ fontSize: 10 }}>{job.finishedAt ? new Date(job.finishedAt).toLocaleTimeString('en-IN', { hour12: false }) : '-'}</td>
                  <td className="num">{job.duration ? `${job.duration}s` : '-'}</td>
                  <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                    {(job.status === 'Scheduled' || job.status === 'Running') && (
                      <button className="sap-btn danger" style={{ fontSize: 10 }} onClick={() => handleCancel(job._id)}>Cancel</button>
                    )}
                    {job.spoolOutput?.length > 0 && (
                      <button className="sap-btn" style={{ fontSize: 10, marginLeft: 2 }} onClick={() => setSelected(job)}>Spool</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spool output */}
        {selected?.spoolOutput?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Spool Output — {selected.jobName}</div>
            <div style={{ background: '#000', color: '#00ff00', fontFamily: 'Courier New, monospace', fontSize: 12, padding: 8, border: '1px solid #333' }}>
              {selected.spoolOutput.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
