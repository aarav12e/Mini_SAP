const express = require('express');
const router = express.Router();
const { ABAPTable, ABAPProgram, FunctionModule, MessageClass, ABAPDump } = require('../models/Workbench');
const { protect } = require('../middleware/auth');

router.use(protect);

// ─── SE11: ABAP Dictionary ────────────────────────────────────────────────────
router.get('/tables', async (req, res) => {
  try {
    const tables = await ABAPTable.find().sort({ tableName: 1 });
    res.json(tables);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tables/:name', async (req, res) => {
  try {
    const table = await ABAPTable.findOne({ tableName: req.params.name.toUpperCase() });
    if (!table) return res.status(404).json({ message: `Table ${req.params.name} not found in dictionary` });
    res.json(table);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/tables', async (req, res) => {
  try {
    const table = await ABAPTable.create({ ...req.body, tableName: req.body.tableName.toUpperCase(), createdBy: req.user.username });
    res.status(201).json({ message: `Table ${table.tableName} created and activated`, table });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/tables/:name', async (req, res) => {
  try {
    const table = await ABAPTable.findOneAndUpdate(
      { tableName: req.params.name.toUpperCase() },
      { ...req.body, status: 'Modified' }, { new: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: `Table ${table.tableName} saved`, table });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/tables/:name/activate', async (req, res) => {
  try {
    const table = await ABAPTable.findOneAndUpdate(
      { tableName: req.params.name.toUpperCase() },
      { status: 'Active' }, { new: true }
    );
    res.json({ message: `Table ${table.tableName} activated successfully`, table });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// SE16N: Table data browser
router.get('/tables/:name/data', async (req, res) => {
  try {
    const table = await ABAPTable.findOne({ tableName: req.params.name.toUpperCase() });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ tableName: table.tableName, fields: table.fields, data: table.tableData || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/tables/:name/data', async (req, res) => {
  try {
    const table = await ABAPTable.findOne({ tableName: req.params.name.toUpperCase() });
    if (!table) return res.status(404).json({ message: 'Table not found' });
    table.tableData.push(req.body.row);
    await table.save();
    res.json({ message: 'Row inserted', tableData: table.tableData });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── SE38: ABAP Editor ────────────────────────────────────────────────────────
router.get('/programs', async (req, res) => {
  try {
    const programs = await ABAPProgram.find().select('-sourceCode').sort({ programName: 1 });
    res.json(programs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/programs/:name', async (req, res) => {
  try {
    const prog = await ABAPProgram.findOne({ programName: req.params.name.toUpperCase() });
    if (!prog) return res.status(404).json({ message: `Program ${req.params.name} does not exist` });
    res.json(prog);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/programs', async (req, res) => {
  try {
    const prog = await ABAPProgram.create({ ...req.body, programName: req.body.programName.toUpperCase(), createdBy: req.user.username });
    res.status(201).json(prog);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/programs/:name', async (req, res) => {
  try {
    const prog = await ABAPProgram.findOneAndUpdate(
      { programName: req.params.name.toUpperCase() },
      req.body, { new: true, upsert: true }
    );
    res.json({ message: 'Program saved', prog });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Execute ABAP (simulated interpreter)
router.post('/programs/:name/execute', async (req, res) => {
  try {
    const prog = await ABAPProgram.findOne({ programName: req.params.name.toUpperCase() });
    if (!prog) return res.status(404).json({ message: 'Program not found' });
    const output = simulateABAP(prog.sourceCode, req.body.params || {});
    if (output.error) {
      const dump = await ABAPDump.create({
        errorType: output.errorType || 'SYNTAX_ERROR',
        programName: prog.programName,
        errorText: output.error,
        lineNo: output.lineNo || 0,
        sourceExtract: output.sourceExtract || '',
        user: req.user.username
      });
      return res.status(200).json({ success: false, dumpId: dump._id, error: output.error, output: [] });
    }
    prog.lastOutput = output.lines;
    await prog.save();
    res.json({ success: true, output: output.lines, message: `Program ${prog.programName} executed successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── SE37: Function Module Builder ───────────────────────────────────────────
router.get('/functions', async (req, res) => {
  try {
    const fms = await FunctionModule.find().sort({ functionName: 1 });
    res.json(fms);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/functions/:name', async (req, res) => {
  try {
    const fm = await FunctionModule.findOne({ functionName: req.params.name.toUpperCase() });
    if (!fm) return res.status(404).json({ message: 'Function module not found' });
    res.json(fm);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/functions', async (req, res) => {
  try {
    const fm = await FunctionModule.create({ ...req.body, functionName: req.body.functionName.toUpperCase(), createdBy: req.user.username });
    res.status(201).json(fm);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/functions/:name', async (req, res) => {
  try {
    const fm = await FunctionModule.findOneAndUpdate(
      { functionName: req.params.name.toUpperCase() }, req.body, { new: true }
    );
    res.json({ message: 'Function module saved', fm });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ─── SE91: Message Classes ────────────────────────────────────────────────────
router.get('/messages', async (req, res) => {
  try {
    const msgs = await MessageClass.find().sort({ messageClass: 1 });
    res.json(msgs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/messages', async (req, res) => {
  try {
    const mc = await MessageClass.create({ ...req.body, createdBy: req.user.username });
    res.status(201).json(mc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/messages/:class', async (req, res) => {
  try {
    const mc = await MessageClass.findOneAndUpdate(
      { messageClass: req.params.class.toUpperCase() }, req.body, { new: true }
    );
    res.json(mc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ─── ST22: ABAP Dumps ─────────────────────────────────────────────────────────
router.get('/dumps', async (req, res) => {
  try {
    const dumps = await ABAPDump.find().sort({ errorTime: -1 }).limit(50);
    res.json(dumps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/dumps/:id', async (req, res) => {
  try {
    const dump = await ABAPDump.findById(req.params.id);
    if (!dump) return res.status(404).json({ message: 'Dump not found' });
    res.json(dump);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── ABAP Simulator ──────────────────────────────────────────────────────────
function simulateABAP(code, params) {
  const lines = code.split('\n');
  const output = [];
  let inSelection = false;
  let hasErrors = false;

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('*') || line.startsWith('"')) continue;

      if (line.toUpperCase().startsWith('REPORT ')) {
        output.push(`> Program: ${line.split(' ')[1]?.replace('.', '')}`);
        continue;
      }
      if (line.toUpperCase() === 'START-OF-SELECTION.') { inSelection = true; continue; }
      if (!inSelection) continue;

      if (line.toUpperCase().startsWith('WRITE:')) {
        const content = line.replace(/WRITE:\s*/i, '').replace(/\.$/, '');
        const parts = content.split(',').map(p => p.trim().replace(/^\/\s*/, '').replace(/['"]/g, ''));
        output.push(parts.join('  '));
        continue;
      }
      if (line.toUpperCase().startsWith('WRITE ')) {
        const content = line.replace(/WRITE\s+/i, '').replace(/\.$/, '').replace(/['"]/g, '');
        output.push(content);
        continue;
      }
      if (line.toUpperCase().startsWith('MESSAGE ')) {
        const content = line.replace(/MESSAGE\s+/i, '').replace(/\.$/, '');
        output.push(`[MSG] ${content}`);
        continue;
      }
      if (line.toUpperCase() === 'ULINE.' || line.toUpperCase() === 'ULINE') {
        output.push('─'.repeat(60));
        continue;
      }
      if (line.toUpperCase().startsWith('SKIP')) {
        output.push('');
        continue;
      }
    }

    if (output.length === 0 && inSelection) output.push('Program executed. No output generated.');
    if (!inSelection && output.length <= 1) output.push('Program executed. Add START-OF-SELECTION. to produce output.');

    return { lines: output };
  } catch (e) {
    return { error: e.message, errorType: 'RUNTIME_ERROR', lineNo: 0, sourceExtract: code.slice(0, 200) };
  }
}

module.exports = router;
