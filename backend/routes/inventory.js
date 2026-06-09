const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { type, plant, lowStock, search } = req.query;
    let query = {};
    if (type) query.materialType = type;
    if (plant) query.plant = plant;
    if (search) query.$or = [
      { materialNo: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
    let materials = await Material.find(query).sort({ materialNo: 1 });
    if (lowStock === 'true') materials = materials.filter(m => m.unrestricted < m.reorderPoint);
    res.json(materials);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const mat = await Material.findOne({ materialNo: req.params.id }) || await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ message: 'Material not found' });
    res.json(mat);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await Material.countDocuments();
    const materialNo = req.body.materialNo || `MAT-${String(1001 + count).padStart(4, '0')}`;
    const mat = await Material.create({ ...req.body, materialNo });
    res.status(201).json(mat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const mat = await Material.findOneAndUpdate(
      { materialNo: req.params.id }, req.body, { new: true }
    );
    if (!mat) return res.status(404).json({ message: 'Not found' });
    res.json(mat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// MB1A - Goods Issue
router.post('/:id/goods-issue', async (req, res) => {
  try {
    const { quantity, movementType, costCenter, text } = req.body;
    const mat = await Material.findOne({ materialNo: req.params.id });
    if (!mat) return res.status(404).json({ message: 'Material not found' });
    if (mat.unrestricted < quantity) return res.status(400).json({ message: `Insufficient stock. Available: ${mat.unrestricted} ${mat.uom}` });
    mat.unrestricted -= quantity;
    await mat.save();
    res.json({ message: `Goods Issue posted. Material doc: ${Date.now()}`, material: mat });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// MB1C - Goods Receipt
router.post('/:id/goods-receipt', async (req, res) => {
  try {
    const { quantity, movementType, vendor, text } = req.body;
    const mat = await Material.findOne({ materialNo: req.params.id });
    if (!mat) return res.status(404).json({ message: 'Material not found' });
    mat.unrestricted += quantity;
    await mat.save();
    res.json({ message: `Goods Receipt posted. Material doc: ${Date.now()}`, material: mat });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Material.countDocuments();
    const materials = await Material.find();
    const lowStock = materials.filter(m => m.unrestricted < m.reorderPoint).length;
    const totalValue = materials.reduce((s, m) => s + (m.unrestricted * m.price), 0);
    res.json({ total, lowStock, totalValue });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
