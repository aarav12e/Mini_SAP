import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function HomeScreen() {
  const { navigate } = useERP();
  const [stats, setStats] = useState({ employees: 0, orders: 0, lowStock: 0, revenue: 0 });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/employees/stats/summary').catch(() => ({ data: {} })),
      api.get('/sales/stats/summary').catch(() => ({ data: {} })),
      api.get('/inventory/stats/summary').catch(() => ({ data: {} })),
      api.get('/messages').catch(() => ({ data: [] })),
    ]).then(([emp, sales, inv, msgs]) => {
      setStats({
        employees: emp.data.total || 0,
        orders: sales.data.open || 0,
        lowStock: inv.data.lowStock || 0,
        revenue: sales.data.totalRevenue || 0,
      });
      setMessages(msgs.data || []);
    });
  }, []);

  const chartData = [
    { month: 'Jan', value: 46 }, { month: 'Feb', value: 52 },
    { month: 'Mar', value: 67 }, { month: 'Apr', value: 59 },
    { month: 'May', value: 75 }, { month: 'Jun', value: 84 },
  ];
  const maxVal = Math.max(...chartData.map(d => d.value));

  return (
    <div>
      <div className="sap-screen-header">
        <span>SAP Easy Access — Main Menu &nbsp;[S000]</span>
        <span style={{ fontSize: 10 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-tile" onClick={() => navigate('PA30')} style={{ cursor: 'pointer' }}>
          <div className="kpi-value">{stats.employees}</div>
          <div className="kpi-label">Employees (PA30)</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-value">₹{(stats.revenue / 100000).toFixed(1)}L</div>
          <div className="kpi-label">Revenue MTD</div>
        </div>
        <div className="kpi-tile" onClick={() => navigate('VA01')} style={{ cursor: 'pointer' }}>
          <div className="kpi-value">{stats.orders}</div>
          <div className="kpi-label">Open Orders (VA03)</div>
        </div>
        <div className="kpi-tile" onClick={() => navigate('MB52')} style={{ cursor: 'pointer' }} >
          <div className="kpi-value" style={{ color: stats.lowStock > 0 ? '#cc0000' : '#003399' }}>{stats.lowStock}</div>
          <div className="kpi-label">Low Stock Items (MB52)</div>
        </div>
      </div>

      {/* System messages */}
      {messages.map((msg, i) => (
        <div key={i} className={`sap-msg ${msg.type === 'E' ? 'error' : msg.type === 'W' ? 'warning' : 'info'}`}>
          <span>{msg.type === 'E' ? '✕' : msg.type === 'W' ? '⚠' : 'ℹ'}</span>
          <span>{msg.text}</span>
        </div>
      ))}

      {/* Chart */}
      <div style={{ padding: '8px 8px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Monthly Revenue Trend (₹ Lakhs)</div>
        {chartData.map(d => (
          <div key={d.month} style={{ display: 'flex', alignItems: 'center', marginBottom: 3, gap: 6 }}>
            <span style={{ fontSize: 10, width: 28, textAlign: 'right' }}>{d.month}</span>
            <div style={{ background: '#003399', height: 14, width: `${(d.value / maxVal) * 60}%`, display: 'flex', alignItems: 'center', paddingLeft: 4, minWidth: 20 }}>
              <span style={{ fontSize: 10, color: '#fff', whiteSpace: 'nowrap' }}>{d.value}L</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch */}
      <div style={{ padding: '8px', borderTop: '1px solid #808080', marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Quick Launch</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            ['PA30 Employee', 'PA30'], ['FB01 Post GL', 'FB01'], ['MB52 Stock', 'MB52'],
            ['VA01 Sales Order', 'VA01'], ['SE38 ABAP Editor', 'SE38'], ['SE11 Dictionary', 'SE11'],
            ['ST22 Dumps', 'ST22'], ['SM37 Jobs', 'SM37'], ['SU01 Users', 'SU01'],
          ].map(([label, tcode]) => (
            <button key={tcode} className="sap-btn" onClick={() => navigate(tcode)}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
