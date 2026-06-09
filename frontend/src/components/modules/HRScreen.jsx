import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

const TABS = ['Basic Data', 'Personal Info', 'Payroll Data', 'Leave'];

export default function HRScreen({ tcode }) {
  const { setStatus } = useERP();
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', department: '', designation: '', employeeGroup: '1-Active', companyCode: '1000', costCenter: '', salary: '', email: '', phone: '' });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', { params: { search } });
      setEmployees(res.data);
    } catch { setStatus('Failed to load employees', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const handleSelect = (emp) => {
    setSelected(emp);
    setForm(emp);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (selected?._id) {
        await api.put(`/employees/${selected.personnelNo}`, form);
        setStatus(`Employee ${selected.personnelNo} saved successfully.`, 'success');
      } else {
        await api.post('/employees', form);
        setStatus('New employee created.', 'success');
      }
      setShowForm(false);
      load();
    } catch (e) { setStatus(e.response?.data?.message || 'Save failed', 'error'); }
  };

  const handleNew = () => {
    setSelected(null);
    setForm({ firstName: '', lastName: '', department: '', designation: '', employeeGroup: '1-Active', companyCode: '1000', costCenter: '', salary: '', email: '', phone: '' });
    setShowForm(true);
  };

  return (
    <div>
      <div className="sap-screen-header">
        <span>HR — Maintain HR Master Data &nbsp;[{tcode}]</span>
      </div>
      <div className="sap-tabs">
        {TABS.map((t, i) => <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>)}
      </div>

      {tab === 0 && (
        <div style={{ padding: 8 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={handleNew}>New Entry (F5)</button>
            {selected && <button className="sap-btn" onClick={handleSave}>Save (Ctrl+S)</button>}
            <button className="sap-btn" onClick={load}>Refresh</button>
            <div className="sap-sep" />
            <input className="sap-input" style={{ width: 180 }} placeholder="Search name / pers.no." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {showForm && (
            <div className="sap-fieldset" style={{ marginBottom: 8 }}>
              <legend>{selected ? `Edit: ${selected.personnelNo} — ${selected.lastName}, ${selected.firstName}` : 'New Employee'}</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {[['Last Name', 'lastName', true], ['First Name', 'firstName', true], ['Department', 'department'], ['Designation', 'designation'], ['Email', 'email'], ['Phone', 'phone'], ['Cost Center', 'costCenter'], ['Salary (INR)', 'salary']].map(([label, key, req]) => (
                  <div className="sap-field-row" key={key}>
                    <span className="sap-field-label" style={{ width: 120 }}>{label}:</span>
                    <input className={`sap-input${req ? ' required' : ''}`} style={{ width: 180 }} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="sap-field-row">
                  <span className="sap-field-label" style={{ width: 120 }}>Employee Group:</span>
                  <select className="sap-select" value={form.employeeGroup} onChange={e => setForm(p => ({ ...p, employeeGroup: e.target.value }))}>
                    {['1-Active', '2-Retiree', '3-Intern', '4-Contract'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="sap-field-row">
                  <span className="sap-field-label" style={{ width: 120 }}>Company Code:</span>
                  <input className="sap-input readonly" style={{ width: 60 }} value={form.companyCode} readOnly />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 126 }}>
                <button className="sap-btn primary" onClick={handleSave}>✓ Save</button>
                <button className="sap-btn" onClick={() => setShowForm(false)}>✕ Cancel</button>
              </div>
            </div>
          )}

          {/* Employee Table */}
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>
            Employee List — {employees.length} record(s)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead>
                <tr>
                  <th>Pers. No.</th><th>Last Name</th><th>First Name</th><th>Department</th>
                  <th>Designation</th><th>Emp. Group</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No records found. Click "New Entry" to create.</td></tr>
                ) : employees.map(emp => (
                  <tr key={emp._id} className={selected?._id === emp._id ? 'selected' : ''} onClick={() => handleSelect(emp)}>
                    <td className="mono">{emp.personnelNo}</td>
                    <td>{emp.lastName?.toUpperCase()}</td>
                    <td>{emp.firstName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.employeeGroup}</td>
                    <td className={emp.status === 'Active' ? 'green' : emp.status === 'On Leave' ? '' : 'red'}>{emp.status}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="sap-btn" style={{ fontSize: 10 }} onClick={() => handleSelect(emp)}>Edit</button>
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
          <div className="sap-msg info">ℹ Select an employee from Basic Data tab to view personal information.</div>
          {selected && (
            <div className="sap-fieldset" style={{ marginTop: 8 }}>
              <legend>Personal Data — {selected.personnelNo}</legend>
              <div className="sap-field-row"><span className="sap-field-label">Full Name:</span><input className="sap-input readonly" value={`${selected.lastName}, ${selected.firstName}`} readOnly style={{ width: 220 }} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Email:</span><input className="sap-input readonly" value={selected.email || ''} readOnly style={{ width: 220 }} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Phone:</span><input className="sap-input readonly" value={selected.phone || ''} readOnly style={{ width: 150 }} /></div>
            </div>
          )}
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          {selected ? (
            <div className="sap-fieldset">
              <legend>Payroll Data — {selected.personnelNo}</legend>
              <div className="sap-field-row"><span className="sap-field-label">Gross Salary:</span><input className="sap-input readonly" value={`₹${(selected.salary || 0).toLocaleString('en-IN')}`} readOnly style={{ width: 150 }} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Cost Center:</span><input className="sap-input readonly" value={selected.costCenter || ''} readOnly /></div>
              <div className="sap-field-row"><span className="sap-field-label">Pay Period:</span><input className="sap-input readonly" value="Monthly" readOnly /></div>
            </div>
          ) : <div className="sap-msg info">ℹ Select an employee first.</div>}
        </div>
      )}

      {tab === 3 && (
        <div className="p8">
          {selected ? (
            <div className="sap-fieldset">
              <legend>Leave Balance — {selected.personnelNo}</legend>
              <div className="sap-field-row"><span className="sap-field-label">Annual Leave:</span><input className="sap-input readonly" value={`${selected.leaveBalance || 20} days`} readOnly style={{ width: 100 }} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Status:</span><input className="sap-input readonly" value={selected.status} readOnly /></div>
            </div>
          ) : <div className="sap-msg info">ℹ Select an employee first.</div>}
        </div>
      )}
    </div>
  );
}
