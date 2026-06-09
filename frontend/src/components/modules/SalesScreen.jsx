import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function SalesScreen({ tcode }) {
  const { setStatus } = useERP();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ orderType: 'OR', customerNo: '', customerName: '', poNumber: '', requestedDelivery: '' });
  const [lineItems, setLineItems] = useState([{ itemNo: '10', materialNo: '', description: '', quantity: '', uom: 'EA', unitPrice: '' }]);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([api.get('/sales'), api.get('/customers')]);
      setOrders(o.data); setCustomers(c.data);
    } catch { setStatus('Load failed', 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const netValue = lineItems.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0)), 0);
  const taxAmount = netValue * 0.18;
  const grandTotal = netValue + taxAmount;

  const addLine = () => setLineItems(p => [...p, { itemNo: String((p.length + 1) * 10), materialNo: '', description: '', quantity: '', uom: 'EA', unitPrice: '' }]);
  const updateLine = (idx, key, val) => setLineItems(p => p.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  const handleSave = async () => {
    try {
      const custObj = customers.find(c => c.customerNo === form.customerNo);
      await api.post('/sales', {
        ...form,
        customerName: custObj?.name || form.customerName,
        lineItems: lineItems.map(i => ({ ...i, quantity: parseFloat(i.quantity) || 0, unitPrice: parseFloat(i.unitPrice) || 0 }))
      });
      setStatus('Sales order created.', 'success');
      setTab(0); load();
    } catch (e) { setStatus(e.response?.data?.message || 'Error', 'error'); }
  };

  const handleDeliver = async (orderNo) => {
    try { await api.post(`/sales/${orderNo}/deliver`); setStatus(`Delivery created for ${orderNo}`, 'success'); load(); } catch (e) { setStatus('Error', 'error'); }
  };

  const handleBill = async (orderNo) => {
    try { const res = await api.post(`/sales/${orderNo}/bill`); setStatus(res.data.message, 'success'); load(); } catch (e) { setStatus('Error', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header"><span>Sales & Distribution &nbsp;[{tcode}]</span></div>
      <div className="sap-tabs">
        {['Order List (VA03)', 'Create Order (VA01)', 'Billing (VF01)'].map((t, i) => (
          <div key={t} className={`sap-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      {tab === 0 && (
        <div className="p8">
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            <button className="sap-btn primary" onClick={() => setTab(1)}>New Order (VA01)</button>
            <button className="sap-btn" onClick={load}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="sap-table">
              <thead><tr><th>Order No.</th><th>Type</th><th>Customer</th><th>PO No.</th><th>Net Value</th><th>Tax</th><th>Grand Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                  : orders.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No orders. Click "New Order".</td></tr>
                  : orders.map(o => (
                  <tr key={o._id} className={selected?._id === o._id ? 'selected' : ''} onClick={() => setSelected(o)}>
                    <td className="mono">{o.orderNo}</td>
                    <td>{o.orderType}</td>
                    <td>{o.customerName}</td>
                    <td>{o.poNumber}</td>
                    <td className="num">₹{(o.netValue || 0).toLocaleString('en-IN')}</td>
                    <td className="num">₹{(o.taxAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="num bold">₹{(o.grandTotal || 0).toLocaleString('en-IN')}</td>
                    <td className={o.status === 'Billed' ? 'green' : o.status === 'Cancelled' ? 'red' : ''}>{o.status}</td>
                    <td onClick={e => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      {o.status === 'Open' && <button className="sap-btn" style={{ fontSize: 10, marginRight: 2 }} onClick={() => handleDeliver(o.orderNo)}>Deliver</button>}
                      {o.status === 'Delivered' && <button className="sap-btn" style={{ fontSize: 10 }} onClick={() => handleBill(o.orderNo)}>Bill (VF01)</button>}
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
          <div className="sap-fieldset">
            <legend>Order Header</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div className="sap-field-row">
                <span className="sap-field-label">Order Type:</span>
                <select className="sap-select" value={form.orderType} onChange={e => setForm(p => ({ ...p, orderType: e.target.value }))}>
                  {['OR', 'ZOR', 'CS', 'CR'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sap-field-row">
                <span className="sap-field-label">Customer No.:</span>
                <select className="sap-select" style={{ width: 200 }} value={form.customerNo} onChange={e => setForm(p => ({ ...p, customerNo: e.target.value }))}>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => <option key={c._id} value={c.customerNo}>{c.customerNo} — {c.name}</option>)}
                </select>
              </div>
              <div className="sap-field-row"><span className="sap-field-label">PO Number:</span><input className="sap-input" style={{ width: 200 }} value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} /></div>
              <div className="sap-field-row"><span className="sap-field-label">Req. Delivery:</span><input type="date" className="sap-input" value={form.requestedDelivery} onChange={e => setForm(p => ({ ...p, requestedDelivery: e.target.value }))} /></div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 3 }}>Order Items</div>
          <table className="sap-table" style={{ marginBottom: 6 }}>
            <thead><tr><th>Itm</th><th>Material No.</th><th>Description</th><th>Qty</th><th>UoM</th><th>Unit Price</th><th>Net Value</th></tr></thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.itemNo}</td>
                  <td><input className="sap-input mono" style={{ width: 90 }} value={item.materialNo} onChange={e => updateLine(idx, 'materialNo', e.target.value)} /></td>
                  <td><input className="sap-input" style={{ width: 160 }} value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} /></td>
                  <td><input className="sap-input mono" style={{ width: 60, textAlign: 'right' }} value={item.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} /></td>
                  <td><input className="sap-input" style={{ width: 40 }} value={item.uom} onChange={e => updateLine(idx, 'uom', e.target.value)} /></td>
                  <td><input className="sap-input mono" style={{ width: 90, textAlign: 'right' }} value={item.unitPrice} onChange={e => updateLine(idx, 'unitPrice', e.target.value)} /></td>
                  <td className="num">₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <button className="sap-btn" onClick={addLine}>+ Add Item</button>
            <div style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>
              <div>Net Value: ₹{netValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div>Tax (18% GST): ₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div className="blue">Grand Total: ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="sap-btn primary" onClick={handleSave}>✓ Save Order (F11)</button>
            <button className="sap-btn" onClick={() => setTab(0)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="p8">
          <div className="sap-msg info">ℹ Billing (VF01) — Select a Delivered order from the Order List to create an invoice.</div>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table className="sap-table">
              <thead><tr><th>Order No.</th><th>Customer</th><th>Grand Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.filter(o => o.status === 'Billed').map(o => (
                  <tr key={o._id}><td className="mono">{o.orderNo}</td><td>{o.customerName}</td><td className="num">₹{(o.grandTotal || 0).toLocaleString('en-IN')}</td><td className="green">Billed</td></tr>
                ))}
                {orders.filter(o => o.status === 'Billed').length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No billed orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
