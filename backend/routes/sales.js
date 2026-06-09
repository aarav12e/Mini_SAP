const express = require('express');
const router = express.Router();
const SalesOrder = require('../models/SalesOrder');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, customer, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query.customerNo = customer;
    if (search) query.$or = [
      { orderNo: new RegExp(search, 'i') },
      { customerName: new RegExp(search, 'i') },
      { poNumber: new RegExp(search, 'i') }
    ];
    const orders = await SalesOrder.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await SalesOrder.findOne({ orderNo: req.params.id }) || await SalesOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const order = await SalesOrder.create({ ...req.body, createdBy: req.user.username });
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await SalesOrder.findOneAndUpdate(
      { orderNo: req.params.id }, req.body, { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/deliver', async (req, res) => {
  try {
    const order = await SalesOrder.findOneAndUpdate(
      { orderNo: req.params.id }, { status: 'Delivered' }, { new: true }
    );
    res.json({ message: `Delivery note created for ${order.orderNo}`, order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/bill', async (req, res) => {
  try {
    const order = await SalesOrder.findOneAndUpdate(
      { orderNo: req.params.id }, { status: 'Billed' }, { new: true }
    );
    const invoiceNo = 'INV-' + Date.now().toString().slice(-8);
    res.json({ message: `Invoice ${invoiceNo} created`, invoiceNo, order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const total = await SalesOrder.countDocuments();
    const open = await SalesOrder.countDocuments({ status: 'Open' });
    const revenue = await SalesOrder.aggregate([
      { $match: { status: { $in: ['Billed', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    res.json({ total, open, totalRevenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
