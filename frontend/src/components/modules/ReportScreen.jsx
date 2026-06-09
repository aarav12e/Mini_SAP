import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function ReportScreen({ tcode }) {
  const { setStatus } = useERP();
  const [tab, setTab] = useState(0);
  const [salesStats, setSalesStats] = useState({});
  const [empStats, setEmpStats] = useState({});
  const [invStats, setInvStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/sales/stats/summary').catch(() => ({ data: {} })),
      api.get('/employees/stats/summary').catch(() => ({ data: {} })),
      api.get('/inventory/stats/summary').catch(() => ({ data: {} })),
    ]).then(([s, e, i]) => {
      setSalesStats(s.data); setEmpStats(e.data); setInvStats(i.data);
    }).finally(() => setLoading(false));
  }, []);

  const plData = [
    { account: '800000 — Sales Revenue', apr: 5900000, may: 7580000, jun: 8420000, type: 'rev' },
    { account: '810000 — Other Income', apr: 120000, may: 95000, jun: 140000, type: 'rev' },
    { account: '400000 — COGS', apr: 3200000, may: 4100000, jun: 4500000, type: 'exp' },
    { account: '630000 — Admin Expense', apr: 450000, may: 480000, jun: 510000, type: 'exp' },
    { account: '640000 — Payroll', apr: 820000, may: 820000, jun: 820000, type: 'exp' },
  ];
  const totRev = (col) => plData.filter(r => r.type === 'rev').reduce((s, r) => s + r[col], 0);
  const totExp = (col) => plData.filter(r => r.type === 'exp').reduce((s, r) => s + r[col], 0);
  const fmt = (n) => `₹${(n / 100000).toFixed(2)}L`;

  return (
    <div>
      <div className="sap-screen-header"><span>Reporting &nbsp;[{tcode}]</span></div>
      <div className="sap-tabs">
        {['KPI Dashboard', 'P&L Statement (S_ALR_87)', 'Sales Analysis (MC.1)', 'HR Summary'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>Executive Dashboard — Current Period</div>
          <div className="kpi-row">
            <div className="kpi-tile"><div className="kpi-value">{empStats.total || 0}</div><div className="kpi-label">Total Employees</div></div>
            <div className="kpi-tile"><div className="kpi-value">{empStats.active || 0}</div><div className="kpi-label">Active</div></div>
            <div className="kpi-tile"><div className="kpi-value">{salesStats.total || 0}</div><div className="kpi-label">Total Orders</div></div>
            <div className="kpi-tile"><div className="kpi-value">₹{((salesStats.totalRevenue || 0) / 100000).toFixed(1)}L</div><div className="kpi-label">Revenue</div></div>
            <div className="kpi-tile"><div className="kpi-value" style={{ color: invStats.lowStock > 0 ? '#cc0000' : '#003399' }}>{invStats.lowStock || 0}</div><div className="kpi-label">Low Stock Items</div></div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 'bold' }}>Department Headcount</div>
          {(empStats.departments || []).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 10, width: 120, textAlign: 'right' }}>{d._id || 'Unknown'}</span>
              <div style={{ background: '#003399', height: 14, width: `${Math.min((d.count / (empStats.total || 1)) * 300, 300)}px`, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                <span style={{ fontSize: 10, color: '#fff' }}>{d.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div className="p8">
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>Report Parameters</legend>
            <div className="sap-field-row"><span className="sap-field-label">Fiscal Year:</span><input className="sap-input" style={{ width: 60 }} defaultValue="2026" /></div>
            <div className="sap-field-row"><span className="sap-field-label">From Period:</span><input className="sap-input" style={{ width: 40 }} defaultValue="001" /></div>
            <div className="sap-field-row"><span className="sap-field-label">To Period:</span><input className="sap-input" style={{ width: 40 }} defaultValue="006" /></div>
            <div style={{ paddingLeft: 166, marginTop: 4 }}><button className="sap-btn primary">Execute (F8)</button></div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Profit & Loss — Apr–Jun 2026</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th style={{ width: 220 }}>Account / Description</th><th>Apr 2026</th><th>May 2026</th><th>Jun 2026</th></tr></thead>
              <tbody>
                <tr><td className="bold blue">Revenue</td><td /><td /><td /></tr>
                {plData.filter(r => r.type === 'rev').map(r => (
                  <tr key={r.account}><td>&nbsp;&nbsp;{r.account}</td><td className="num">{fmt(r.apr)}</td><td className="num">{fmt(r.may)}</td><td className="num">{fmt(r.jun)}</td></tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}><td className="blue">Total Revenue</td><td className="num blue">{fmt(totRev('apr'))}</td><td className="num blue">{fmt(totRev('may'))}</td><td className="num blue">{fmt(totRev('jun'))}</td></tr>
                <tr><td className="bold">Expenses</td><td /><td /><td /></tr>
                {plData.filter(r => r.type === 'exp').map(r => (
                  <tr key={r.account}><td>&nbsp;&nbsp;{r.account}</td><td className="num">{fmt(r.apr)}</td><td className="num">{fmt(r.may)}</td><td className="num">{fmt(r.jun)}</td></tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}><td>Total Expenses</td><td className="num">{fmt(totExp('apr'))}</td><td className="num">{fmt(totExp('may'))}</td><td className="num">{fmt(totExp('jun'))}</td></tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #003399' }}>
                  <td className="blue">Net Profit</td>
                  <td className="num blue">{fmt(totRev('apr') - totExp('apr'))}</td>
                  <td className="num blue">{fmt(totRev('may') - totExp('may'))}</td>
                  <td className="num blue">{fmt(totRev('jun') - totExp('jun'))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div className="sap-msg info">ℹ Sales Analysis (MC.1) — Based on posted sales orders.</div>
          <div className="kpi-row" style={{ marginTop: 8 }}>
            <div className="kpi-tile"><div className="kpi-value">{salesStats.total || 0}</div><div className="kpi-label">Total Orders</div></div>
            <div className="kpi-tile"><div className="kpi-value">{salesStats.open || 0}</div><div className="kpi-label">Open</div></div>
            <div className="kpi-tile"><div className="kpi-value">₹{((salesStats.totalRevenue || 0) / 100000).toFixed(2)}L</div><div className="kpi-label">Total Revenue (Billed)</div></div>
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="p8">
          <div className="sap-msg info">ℹ HR Summary Report — Active headcount by department.</div>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="sap-table">
              <thead><tr><th>Department</th><th>Count</th></tr></thead>
              <tbody>
                {(empStats.departments || []).map((d, i) => (
                  <tr key={i}><td>{d._id || 'Unknown'}</td><td className="num">{d.count}</td></tr>
                ))}
                {(!empStats.departments || empStats.departments.length === 0) && <tr><td colSpan={2} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No data. Add employees first.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
