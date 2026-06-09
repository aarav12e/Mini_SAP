// SE91Screen.jsx
import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function SE91Screen() {
  const { setStatus } = useERP();
  const [classes, setClasses] = useState([]);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ messageClass: '', description: '' });
  const [messages, setMessages] = useState([
    { msgNo: '001', msgType: 'E', text: 'Object & not found.' },
    { msgNo: '002', msgType: 'W', text: 'Field & is empty.' },
    { msgNo: '003', msgType: 'I', text: 'Processing & completed.' },
    { msgNo: '004', msgType: 'S', text: 'Record & saved successfully.' },
  ]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/workbench/messages'); setClasses(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.messageClass) return setStatus('Message class name required.', 'error');
    try {
      if (selected?._id) {
        await api.put(`/workbench/messages/${form.messageClass}`, { ...form, messages });
      } else {
        await api.post('/workbench/messages', { ...form, messages });
      }
      setStatus(`Message class ${form.messageClass} saved.`, 'success');
      setTab(0); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  const addMsg = () => setMessages(p => [...p, { msgNo: String(p.length + 1).padStart(3, '0'), msgType: 'E', text: '' }]);
  const updateMsg = (idx, key, val) => setMessages(p => p.map((m, i) => i === idx ? { ...m, [key]: val } : m));

  const MSG_TYPE_COLORS = { E: '#cc0000', W: '#7a5000', I: '#003399', S: '#006600', A: '#cc0000' };
  const MSG_TYPE_LABELS = { E: 'E — Error', W: 'W — Warning', I: 'I — Info', S: 'S — Success', A: 'A — Abort' };

  return (
    <div>
      <div className="sap-screen-header"><span>Message Maintenance &nbsp;[SE91]</span></div>
      <div className="sap-tabs">
        {['Message Classes', 'Create / Edit'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={() => { setSelected(null); setForm({ messageClass: '', description: '' }); setMessages([{ msgNo: '001', msgType: 'E', text: '' }]); setTab(1); }}>Create (F5)</button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <table className="sap-table">
            <thead><tr><th>Message Class</th><th>Description</th><th># Messages</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                : classes.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No message classes. Click "Create".</td></tr>
                : classes.map(mc => (
                <tr key={mc._id}>
                  <td className="mono bold">{mc.messageClass}</td>
                  <td>{mc.description}</td>
                  <td className="num">{mc.messages?.length || 0}</td>
                  <td><button className="sap-btn" style={{ fontSize: 10 }} onClick={() => { setSelected(mc); setForm({ messageClass: mc.messageClass, description: mc.description }); setMessages(mc.messages || []); setTab(1); }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 1 && (
        <div className="p8">
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>Message Class Attributes</legend>
            <div className="sap-field-row"><span className="sap-field-label">Message Class:</span>
              <input className="sap-input required mono" style={{ width: 120, textTransform: 'uppercase' }} value={form.messageClass}
                onChange={e => setForm(p => ({ ...p, messageClass: e.target.value.toUpperCase() }))} placeholder="ZMSG_CLASS" />
            </div>
            <div className="sap-field-row"><span className="sap-field-label">Description:</span>
              <input className="sap-input" style={{ width: 280 }} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Messages</div>
          <div style={{ marginBottom: 4, fontSize: 10, color: '#555' }}>
            Use &amp; as placeholder. In ABAP: MESSAGE E001({form.messageClass || 'ZMSG'}) WITH 'value'.
          </div>
          <table className="sap-table" style={{ marginBottom: 6 }}>
            <thead><tr><th style={{ width: 60 }}>No.</th><th style={{ width: 100 }}>Type</th><th>Message Text</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {messages.map((msg, idx) => (
                <tr key={idx}>
                  <td><input className="sap-input mono" style={{ width: 50 }} value={msg.msgNo} onChange={e => updateMsg(idx, 'msgNo', e.target.value)} /></td>
                  <td>
                    <select className="sap-select" value={msg.msgType} onChange={e => updateMsg(idx, 'msgType', e.target.value)}
                      style={{ color: MSG_TYPE_COLORS[msg.msgType] }}>
                      {Object.entries(MSG_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td><input className="sap-input" style={{ width: '100%' }} value={msg.text} onChange={e => updateMsg(idx, 'text', e.target.value)} placeholder="Message text (use & as placeholder)" /></td>
                  <td><button className="sap-btn" style={{ fontSize: 10, color: '#cc0000' }} onClick={() => setMessages(p => p.filter((_, i) => i !== idx))}>Del</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn" onClick={addMsg}>+ Add Message</button>
            <button className="sap-btn primary" onClick={handleSave}>💾 Save</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
