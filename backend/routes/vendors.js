const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { vendorNo: new RegExp(search, 'i') },
      { name: new RegExp(search, 'i') }
    ];
    const vendors = await Vendor.find(query).sort({ vendorNo: 1 });
    res.json(vendors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const v = await Vendor.findOne({ vendorNo: req.params.id }) || await Vendor.findById(req.params.id);
    if (!v) return res.status(404).json({ message: 'Vendor not found' });
    res.json(v);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await Vendor.countDocuments();
    const vendorNo = req.body.vendorNo || `VEND-${String(1001 + count).padStart(4, '0')}`;
    const v = await Vendor.create({ ...req.body, vendorNo });
    res.status(201).json(v);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const v = await Vendor.findOneAndUpdate({ vendorNo: req.params.id }, req.body, { new: true });
    if (!v) return res.status(404).json({ message: 'Not found' });
    res.json(v);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
