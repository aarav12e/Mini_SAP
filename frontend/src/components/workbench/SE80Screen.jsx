import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import api from '../../utils/api';

export default function SE80Screen() {
  const { navigate } = useERP();
  const [tables, setTables] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState({ tables: true, programs: true, functions: false, messages: false });
  const [loading, setLoading] = useState(false);
  const [packageFilter, setPackageFilter] = useState('$TMP');

  const load = async () => {
    setLoading(true);
    try {
      const [t, p, f, m] = await Promise.all([
        api.get('/workbench/tables'),
        api.get('/workbench/programs'),
        api.get('/workbench/functions'),
        api.get('/workbench/messages'),
      ]);
      setTables(t.data); setPrograms(p.data); setFunctions(f.data); setMessages(m.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const TreeItem = ({ icon, label, onClick, status }) => (
    <div onClick={onClick} style={{ padding: '1px 4px 1px 20px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
      onMouseEnter={e => { e.currentTarget.style.background = '#003399'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
      <span>{icon}</span>
      <span style={{ fontFamily: 'Courier New, monospace' }}>{label}</span>
      {status && <span style={{ fontSize: 9, color: status === 'Active' ? '#006600' : '#cc0000', marginLeft: 4 }}>[{status}]</span>}
    </div>
  );

  const Section = ({ treeKey, label, icon, items, renderItem }) => (
    <>
      <div onClick={() => toggle(treeKey)}
        style={{ padding: '2px 4px', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid #c0bdb5' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#003399'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
        <span>{expanded[treeKey] ? '▼' : '▶'}</span>
        <span>{icon} {label}</span>
        <span style={{ fontSize: 10, color: '#555', marginLeft: 4 }}>({items.length})</span>
      </div>
      {expanded[treeKey] && items.map(renderItem)}
    </>
  );

  const allObjects = tables.length + programs.length + functions.length + messages.length;

  return (
    <div>
      <div className="sap-screen-header"><span>Object Navigator &nbsp;[SE80]</span></div>
      <div style={{ display: 'flex', height: 'calc(100vh - 160px)', overflow: 'hidden' }}>

        {/* Left tree panel */}
        <div style={{ width: 280, borderRight: '1px solid #808080', background: '#d4d0c8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ background: '#003399', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '3px 6px' }}>
            Repository Browser
          </div>
          <div style={{ padding: 4, borderBottom: '1px solid #808080' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11 }}>Package:</span>
              <input className="sap-input mono" style={{ width: 100, textTransform: 'uppercase', fontSize: 11 }} value={packageFilter} onChange={e => setPackageFilter(e.target.value.toUpperCase())} />
              <button className="sap-btn" style={{ fontSize: 10 }} onClick={load}>▶</button>
            </div>
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {loading ? <div style={{ padding: 8, fontSize: 11, color: '#555' }}>Loading repository...</div> : (
              <>
                <Section treeKey="tables" label="Dictionary Objects" icon="📋" items={tables}
                  renderItem={(t) => <TreeItem key={t._id} icon="🗃" label={t.tableName} status={t.status} onClick={() => navigate('SE11')} />}
                />
                <Section treeKey="programs" label="Programs / Reports" icon="📄" items={programs}
                  renderItem={(p) => <TreeItem key={p._id} icon="📝" label={p.programName} onClick={() => navigate('SE38')} />}
                />
                <Section treeKey="functions" label="Function Modules" icon="⚙" items={functions}
                  renderItem={(f) => <TreeItem key={f._id} icon="🔧" label={f.functionName} onClick={() => navigate('SE37')} />}
                />
                <Section treeKey="messages" label="Message Classes" icon="💬" items={messages}
                  renderItem={(m) => <TreeItem key={m._id} icon="✉" label={m.messageClass} onClick={() => navigate('SE91')} />}
                />
              </>
            )}
          </div>
        </div>

        {/* Right detail panel */}
        <div style={{ flex: 1, padding: 8, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>
            Repository Summary — Package: {packageFilter}
          </div>

          <div className="kpi-row" style={{ marginBottom: 12 }}>
            <div className="kpi-tile" style={{ cursor: 'pointer' }} onClick={() => navigate('SE11')}>
              <div className="kpi-value" style={{ fontSize: 24 }}>{tables.length}</div>
              <div className="kpi-label">Dictionary Tables (SE11)</div>
            </div>
            <div className="kpi-tile" style={{ cursor: 'pointer' }} onClick={() => navigate('SE38')}>
              <div className="kpi-value" style={{ fontSize: 24 }}>{programs.length}</div>
              <div className="kpi-label">Programs (SE38)</div>
            </div>
            <div className="kpi-tile" style={{ cursor: 'pointer' }} onClick={() => navigate('SE37')}>
              <div className="kpi-value" style={{ fontSize: 24 }}>{functions.length}</div>
              <div className="kpi-label">Function Modules (SE37)</div>
            </div>
            <div className="kpi-tile" style={{ cursor: 'pointer' }} onClick={() => navigate('SE91')}>
              <div className="kpi-value" style={{ fontSize: 24 }}>{messages.length}</div>
              <div className="kpi-label">Message Classes (SE91)</div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>Quick Navigation</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {[['SE11', 'ABAP Dictionary'], ['SE38', 'ABAP Editor'], ['SE37', 'Function Builder'], ['SE16N', 'Table Browser'], ['SE91', 'Messages'], ['ST22', 'Dump Analysis'], ['SM37', 'Job Monitor'], ['SU01', 'User Admin']].map(([tc, label]) => (
              <button key={tc} className="sap-btn" onClick={() => navigate(tc)}><span className="mono bold">{tc}</span> — {label}</button>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Recent Repository Objects</div>
          <table className="sap-table">
            <thead><tr><th>Object Type</th><th>Object Name</th><th>Description</th><th>Go To</th></tr></thead>
            <tbody>
              {tables.slice(0, 3).map(t => <tr key={t._id}><td>TABLE</td><td className="mono bold">{t.tableName}</td><td>{t.description}</td><td><button className="sap-btn" style={{ fontSize: 10 }} onClick={() => navigate('SE11')}>SE11</button></td></tr>)}
              {programs.slice(0, 3).map(p => <tr key={p._id}><td>PROG</td><td className="mono bold">{p.programName}</td><td>{p.description}</td><td><button className="sap-btn" style={{ fontSize: 10 }} onClick={() => navigate('SE38')}>SE38</button></td></tr>)}
              {functions.slice(0, 2).map(f => <tr key={f._id}><td>FUNC</td><td className="mono bold">{f.functionName}</td><td>{f.description}</td><td><button className="sap-btn" style={{ fontSize: 10 }} onClick={() => navigate('SE37')}>SE37</button></td></tr>)}
              {allObjects === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 8, color: '#555' }}>No objects in repository. Start by creating a table in SE11 or a program in SE38.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
