const express = require('express');
const router = express.Router();
const GLDocument = require('../models/GLDocument');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, type, from, to } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.documentType = type;
    if (from || to) {
      query.postingDate = {};
      if (from) query.postingDate.$gte = new Date(from);
      if (to) query.postingDate.$lte = new Date(to);
    }
    const docs = await GLDocument.find(query).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await GLDocument.findOne({ documentNo: req.params.id }) || await GLDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const doc = await GLDocument.create({ ...req.body, postedBy: req.user.username });
    res.status(201).json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const doc = await GLDocument.findOneAndUpdate(
      { documentNo: req.params.id }, req.body, { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/post', async (req, res) => {
  try {
    const doc = await GLDocument.findOne({ documentNo: req.params.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (!doc.isBalanced) return res.status(400).json({ message: 'Document not balanced. Debit must equal Credit.' });
    doc.status = 'Posted';
    await doc.save();
    res.json({ message: `Document ${doc.documentNo} posted successfully`, doc });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/report/pl', async (req, res) => {
  try {
    const { year } = req.query;
    const fy = year || new Date().getFullYear();
    const docs = await GLDocument.find({
      status: 'Posted',
      postingDate: { $gte: new Date(`${fy}-04-01`), $lte: new Date(`${parseInt(fy)+1}-03-31`) }
    });
    const summary = {};
    docs.forEach(doc => {
      const month = new Date(doc.postingDate).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!summary[month]) summary[month] = { revenue: 0, expense: 0 };
      doc.lineItems.forEach(item => {
        const acc = parseInt(item.glAccount);
        if (acc >= 800000 && acc < 900000) {
          summary[month].revenue += item.debitCredit === 'Credit' ? item.amount : -item.amount;
        } else if (acc >= 400000 && acc < 800000) {
          summary[month].expense += item.debitCredit === 'Debit' ? item.amount : -item.amount;
        }
      });
    });
    res.json(summary);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
