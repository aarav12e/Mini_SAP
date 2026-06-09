const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { customerNo: new RegExp(search, 'i') },
      { name: new RegExp(search, 'i') },
      { gstin: new RegExp(search, 'i') }
    ];
    const customers = await Customer.find(query).sort({ customerNo: 1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await Customer.findOne({ customerNo: req.params.id }) || await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    const customerNo = req.body.customerNo || `CUST-${String(1001 + count).padStart(4, '0')}`;
    const c = await Customer.create({ ...req.body, customerNo });
    res.status(201).json(c);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const c = await Customer.findOneAndUpdate({ customerNo: req.params.id }, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
