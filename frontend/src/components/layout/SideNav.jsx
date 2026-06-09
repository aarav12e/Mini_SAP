import React from 'react';
import { useERP } from '../../context/ERPContext';

const NavSection = ({ label, navKey, items }) => {
  const { navExpanded, toggleNav, navigate } = useERP();
  const isOpen = navExpanded[navKey];
  return (
    <>
      <div
        onClick={() => toggleNav(navKey)}
        style={{ fontSize: 11, fontWeight: 'bold', padding: '3px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, userSelect: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#003399'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
      >
        <span>{isOpen ? '▼' : '▶'}</span> {label}
      </div>
      {isOpen && items.map(({ label, tcode }) => (
        <div
          key={tcode}
          onClick={() => navigate(tcode)}
          style={{ fontSize: 11, padding: '2px 4px 2px 18px', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#003399'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
        >
          {label}
        </div>
      ))}
    </>
  );
};

export default function SideNav() {
  const { navigate } = useERP();
  return (
    <div style={{ width: 200, background: '#d4d0c8', borderRight: '1px solid #808080', padding: 4, overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ background: '#003399', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '3px 6px', marginBottom: 4 }}>
        SAP Easy Access
      </div>

      <div style={{ fontSize: 11, fontWeight: 'bold', padding: '3px 4px', cursor: 'pointer', color: '#003399' }}
        onClick={() => navigate('S000')}>⌂ Home Dashboard</div>

      <NavSection label="HR Module" navKey="hr" items={[
        { label: 'PA30 — Employee Master', tcode: 'PA30' },
        { label: 'PA40 — Actions', tcode: 'PA40' },
        { label: 'PA61 — Leave Management', tcode: 'PA61' },
        { label: 'PC00 — Payroll Run', tcode: 'PC00' },
        { label: 'PT60 — Time Sheet', tcode: 'PT60' },
      ]} />

      <NavSection label="Finance (FI)" navKey="fi" items={[
        { label: 'FB01 — Post GL Entry', tcode: 'FB01' },
        { label: 'FB50 — Enter GL Doc', tcode: 'FB50' },
        { label: 'F-02 — Vendor Invoice', tcode: 'F-02' },
        { label: 'FBL1N — Vendor Ledger', tcode: 'FBL1N' },
        { label: 'FBL5N — Customer Ledger', tcode: 'FBL5N' },
        { label: 'FS10N — GL Account Balance', tcode: 'FS10N' },
      ]} />

      <NavSection label="Inventory (MM)" navKey="mm" items={[
        { label: 'MM01 — Create Material', tcode: 'MM01' },
        { label: 'MB52 — Stock Overview', tcode: 'MB52' },
        { label: 'MB1A — Goods Issue', tcode: 'MB1A' },
        { label: 'MB1C — Goods Receipt', tcode: 'MB1C' },
        { label: 'MIGO — Goods Movement', tcode: 'MIGO' },
      ]} />

      <NavSection label="Sales (SD)" navKey="sd" items={[
        { label: 'VA01 — Create Order', tcode: 'VA01' },
        { label: 'VA02 — Change Order', tcode: 'VA02' },
        { label: 'VA03 — Display Order', tcode: 'VA03' },
        { label: 'VF01 — Create Invoice', tcode: 'VF01' },
        { label: 'VL01N — Create Delivery', tcode: 'VL01N' },
      ]} />

      <NavSection label="Customers / Vendors" navKey="cv" items={[
        { label: 'XD01 — Create Customer', tcode: 'XD01' },
        { label: 'XK01 — Create Vendor', tcode: 'XK01' },
      ]} />

      <NavSection label="ABAP Workbench" navKey="wb" items={[
        { label: 'SE11 — ABAP Dictionary', tcode: 'SE11' },
        { label: 'SE16N — Table Browser', tcode: 'SE16N' },
        { label: 'SE38 — ABAP Editor', tcode: 'SE38' },
        { label: 'SE80 — Object Navigator', tcode: 'SE80' },
        { label: 'SE37 — Function Builder', tcode: 'SE37' },
        { label: 'SE24 — Class Builder', tcode: 'SE24' },
        { label: 'SE91 — Message Classes', tcode: 'SE91' },
        { label: 'SM37 — Job Monitor', tcode: 'SM37' },
        { label: 'SM50 — Process Overview', tcode: 'SM50' },
        { label: 'ST22 — ABAP Dumps', tcode: 'ST22' },
        { label: 'SU01 — User Management', tcode: 'SU01' },
      ]} />

      <NavSection label="Reporting" navKey="rep" items={[
        { label: 'S_ALR_87 — Financial Stmt', tcode: 'S_ALR_87' },
        { label: 'MC.1 — Sales Analysis', tcode: 'MC.1' },
      ]} />
    </div>
  );
}
