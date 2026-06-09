import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useERP, TCODE_MAP } from '../context/ERPContext';
import SideNav from '../components/layout/SideNav';
import HomeScreen from '../components/modules/HomeScreen';
import HRScreen from '../components/modules/HRScreen';
import FinanceScreen from '../components/modules/FinanceScreen';
import InventoryScreen from '../components/modules/InventoryScreen';
import SalesScreen from '../components/modules/SalesScreen';
import CustomerScreen from '../components/modules/CustomerScreen';
import VendorScreen from '../components/modules/VendorScreen';
import ReportScreen from '../components/modules/ReportScreen';
import SE11Screen from '../components/workbench/SE11Screen';
import SE16NScreen from '../components/workbench/SE16NScreen';
import SE38Screen from '../components/workbench/SE38Screen';
import SE37Screen from '../components/workbench/SE37Screen';
import SE91Screen from '../components/workbench/SE91Screen';
import SM37Screen from '../components/workbench/SM37Screen';
import SM50Screen from '../components/workbench/SM50Screen';
import ST22Screen from '../components/workbench/ST22Screen';
import SU01Screen from '../components/workbench/SU01Screen';
import SE80Screen from '../components/workbench/SE80Screen';

const SCREENS = {
  home: HomeScreen,
  hr: HRScreen,
  finance: FinanceScreen,
  inventory: InventoryScreen,
  sales: SalesScreen,
  customers: CustomerScreen,
  vendors: VendorScreen,
  report: ReportScreen,
  se11: SE11Screen,
  se16n: SE16NScreen,
  se38: SE38Screen,
  se80: SE80Screen,
  se37: SE37Screen,
  se91: SE91Screen,
  sm37: SM37Screen,
  sm50: SM50Screen,
  st22: ST22Screen,
  su01: SU01Screen,
  se24: SE38Screen, // reuse editor for class builder
};

export default function ERPShell() {
  const { user, logout } = useAuth();
  const { currentTcode, currentScreen, statusMsg, navigate, setStatus } = useERP();
  const [tcodeInput, setTcodeInput] = useState('S000');
  const tcodeRef = useRef(null);

  const handleTcodeEnter = (e) => {
    if (e.key === 'Enter') {
      navigate(tcodeInput);
    }
  };

  const ScreenComponent = SCREENS[currentScreen] || HomeScreen;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#d4d0c8', overflow: 'hidden' }}>

      {/* Title bar */}
      <div style={{ background: '#003399', color: '#fff', padding: '2px 8px', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span>SAP Easy Access &nbsp;|&nbsp; Mini ERP v7.00 &nbsp;|&nbsp; Client 100 &nbsp;|&nbsp; RFH Systems</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, marginRight: 8 }}>{dateStr} {timeStr}</span>
          <div style={{ background: '#d4d0c8', border: '1px solid #808080', color: '#000', width: 16, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>_</div>
          <div style={{ background: '#d4d0c8', border: '1px solid #808080', color: '#000', width: 16, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>□</div>
          <div onClick={logout} style={{ background: '#d4d0c8', border: '1px solid #808080', color: '#000', width: 16, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
        </div>
      </div>

      {/* Menu bar */}
      <div style={{ background: '#d4d0c8', borderBottom: '1px solid #808080', display: 'flex', alignItems: 'center', padding: '1px 4px', flexShrink: 0 }}>
        {['Menu', 'Edit', 'Favorites', 'Extras', 'System', 'Help'].map(m => (
          <span key={m} style={{ padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}
            onMouseEnter={e => { e.target.style.background = '#003399'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = ''; e.target.style.color = ''; }}>
            {m}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#555', padding: '0 8px' }}>
          User: {user?.username} &nbsp;|&nbsp; Role: {user?.role}
        </span>
      </div>

      {/* Toolbar */}
      <div className="sap-toolbar" style={{ flexShrink: 0 }}>
        <button className="sap-btn" onClick={() => navigate('S000')} title="Back">◀</button>
        <button className="sap-btn" onClick={() => navigate('S000')} title="Home">⌂</button>
        <div className="sap-sep" />
        <button className="sap-btn" title="Save" onClick={() => setStatus('Data saved successfully.', 'success')}>💾</button>
        <button className="sap-btn" title="Execute" onClick={() => setStatus('Executing...', 'info')}>▶</button>
        <button className="sap-btn" title="Print">🖨</button>
        <button className="sap-btn" title="Find">🔍</button>
        <div className="sap-sep" />
        <button className="sap-btn" onClick={() => navigate('S000')}>Easy Access</button>
        <button className="sap-btn" onClick={() => navigate('SE38')}>SE38</button>
        <button className="sap-btn" onClick={() => navigate('SE11')}>SE11</button>
        <button className="sap-btn" onClick={() => navigate('ST22')}>ST22</button>
        <div className="sap-sep" />
        <button className="sap-btn danger" onClick={logout}>Log Off</button>
      </div>

      {/* T-code bar */}
      <div style={{ background: '#d4d0c8', borderBottom: '1px solid #808080', display: 'flex', alignItems: 'center', padding: '2px 4px', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 11 }}>Transaction:</span>
        <input
          ref={tcodeRef}
          className="sap-input mono"
          style={{ width: 130, textTransform: 'uppercase' }}
          value={tcodeInput}
          onChange={e => setTcodeInput(e.target.value.toUpperCase())}
          onKeyDown={handleTcodeEnter}
          placeholder="T-code"
        />
        <button className="sap-btn" onClick={() => navigate(tcodeInput)}>▶</button>
        <span style={{ fontSize: 10, color: '#555', marginLeft: 8 }}>
          Available T-codes: PA30, FB01, MM01, VA01, SE11, SE38, SE37, SE16N, SM37, SM50, ST22, SU01, SE91, SE80
        </span>
      </div>

      {/* Body: nav + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SideNav />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ScreenComponent tcode={currentTcode} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="sap-status-bar" style={{ flexShrink: 0 }}>
        <span className={`status-msg-${statusMsg.type}`}>{statusMsg.text}</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#444' }}>
          <span>INS</span>
          <span style={{ borderLeft: '1px solid #808080', paddingLeft: 6 }}>Client: 100</span>
          <span style={{ borderLeft: '1px solid #808080', paddingLeft: 6 }}>Server: ERPSRV01</span>
          <span style={{ borderLeft: '1px solid #808080', paddingLeft: 6 }}>T: {currentTcode}</span>
        </div>
      </div>
    </div>
  );
}
