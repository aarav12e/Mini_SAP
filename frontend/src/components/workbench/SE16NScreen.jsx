import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function SE16NScreen({ tcode }) {
  const { setStatus } = useERP();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState({ fields: [], data: [] });
  const [tableName, setTableName] = useState('');
  const [newRow, setNewRow] = useState({});
  const [showInsert, setShowInsert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxRows, setMaxRows] = useState(200);

  const loadTables = async () => {
    try { const r = await api.get('/workbench/tables'); setTables(r.data); } catch {}
  };

  useEffect(() => { loadTables(); }, []);

  const browseTable = async (name) => {
    if (!name) return setStatus('Enter a table name.', 'error');
    setLoading(true);
    try {
      const r = await api.get(`/workbench/tables/${name.toUpperCase()}/data`);
      setTableData(r.data);
      setSelectedTable(r.data.tableName);
      setNewRow({});
      setStatus(`Table ${name.toUpperCase()} — ${r.data.data.length} entries selected.`, 'success');
    } catch (e) {
      setStatus(e.response?.data?.message || 'Table not found in SE11.', 'error');
    }
    setLoading(false);
  };

  const insertRow = async () => {
    try {
      await api.post(`/workbench/tables/${selectedTable}/data`, { row: newRow });
      setStatus('1 entry inserted.', 'success');
      setShowInsert(false);
      browseTable(selectedTable);
    } catch (e) { setStatus('Insert failed', 'error'); }
  };

  return (
    <div>
      <div className="sap-screen-header">
        <span>General Table Display &nbsp;[{tcode}]</span>
      </div>

      <div style={{ padding: 8 }}>
        {/* Selection screen */}
        <div className="sap-fieldset" style={{ marginBottom: 8 }}>
          <legend>Table Selection</legend>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="sap-field-row">
              <span className="sap-field-label">Table Name:</span>
              <input
                className="sap-input required mono"
                style={{ width: 160, textTransform: 'uppercase' }}
                value={tableName}
                onChange={e => setTableName(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && browseTable(tableName)}
                placeholder="e.g. ZTABLE"
              />
            </div>
            <div className="sap-field-row">
              <span className="sap-field-label" style={{ width: 70 }}>Max Rows:</span>
              <input className="sap-input mono" style={{ width: 60 }} value={maxRows} onChange={e => setMaxRows(e.target.value)} />
            </div>
            <button className="sap-btn primary" onClick={() => browseTable(tableName)}>Execute (F8)</button>
            <button className="sap-btn" onClick={() => setShowInsert(!showInsert)} disabled={!selectedTable}>+ Insert Row</button>
          </div>

          {/* Quick-pick from known tables */}
          {tables.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#555' }}>Known tables:</span>
              {tables.map(t => (
                <button key={t._id} className="sap-btn" style={{ fontSize: 10 }}
                  onClick={() => { setTableName(t.tableName); browseTable(t.tableName); }}>
                  {t.tableName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Insert row form */}
        {showInsert && selectedTable && tableData.fields.length > 0 && (
          <div className="sap-fieldset" style={{ marginBottom: 8 }}>
            <legend>Insert Row into {selectedTable}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {tableData.fields.map(f => (
                <div className="sap-field-row" key={f.fieldName}>
                  <span className="sap-field-label" style={{ width: 130 }}>
                    {f.fieldName}{f.isKey ? ' 🔑' : ''}:
                  </span>
                  <input
                    className={`sap-input mono${f.isKey ? ' required' : ''}`}
                    style={{ width: 160 }}
                    placeholder={`${f.dataType}(${f.length})`}
                    value={newRow[f.fieldName] || ''}
                    onChange={e => setNewRow(p => ({ ...p, [f.fieldName]: e.target.value }))}
                  />
                  <span style={{ fontSize: 10, color: '#555', marginLeft: 4 }}>{f.description}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 136 }}>
              <button className="sap-btn primary" onClick={insertRow}>✓ Insert</button>
              <button className="sap-btn" onClick={() => setShowInsert(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Table contents */}
        {selectedTable && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 'bold' }}>
                Table: <span className="mono">{selectedTable}</span> — {tableData.data.slice(0, maxRows).length} entr(ies) displayed
              </div>
              <button className="sap-btn" style={{ fontSize: 10 }} onClick={() => browseTable(selectedTable)}>Refresh</button>
            </div>

            {tableData.fields.length === 0 ? (
              <div className="sap-msg warning">⚠ Table has no fields defined. Define fields in SE11.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      {tableData.fields.map(f => (
                        <th key={f.fieldName} title={f.description}>
                          {f.isKey ? '🔑 ' : ''}{f.fieldName}
                          <div style={{ fontSize: 9, fontWeight: 'normal', color: '#cce' }}>{f.dataType}({f.length})</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={tableData.fields.length + 1} style={{ textAlign: 'center', padding: 8 }}>Loading...</td></tr>
                    ) : tableData.data.length === 0 ? (
                      <tr><td colSpan={tableData.fields.length + 1} style={{ textAlign: 'center', padding: 8, color: '#555' }}>
                        No entries in table. Use "Insert Row" to add data.
                      </td></tr>
                    ) : tableData.data.slice(0, maxRows).map((row, i) => (
                      <tr key={i}>
                        <td className="num" style={{ color: '#555' }}>{i + 1}</td>
                        {tableData.fields.map(f => (
                          <td key={f.fieldName} className={f.isKey ? 'bold' : ''}>
                            {row[f.fieldName] !== undefined ? String(row[f.fieldName]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {!selectedTable && (
          <div className="sap-msg info">ℹ Enter a table name created in SE11 and click Execute (F8) to browse its contents.</div>
        )}
      </div>
    </div>
  );
}
