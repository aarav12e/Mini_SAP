const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, dept, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (dept) query.department = dept;
    if (search) query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { personnelNo: new RegExp(search, 'i') }
    ];
    const employees = await Employee.find(query).sort({ personnelNo: 1 });
    res.json(employees);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOne({ personnelNo: req.params.id }) || await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    const personnelNo = req.body.personnelNo || String(10001 + count);
    const emp = await Employee.create({ ...req.body, personnelNo });
    res.status(201).json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOneAndUpdate(
      { personnelNo: req.params.id }, req.body, { new: true, runValidators: true }
    );
    if (!emp) return res.status(404).json({ message: 'Not found' });
    res.json(emp);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Employee.findOneAndUpdate({ personnelNo: req.params.id }, { status: 'Terminated' });
    res.json({ message: 'Employee terminated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'Active' });
    const onLeave = await Employee.countDocuments({ status: 'On Leave' });
    const depts = await Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    res.json({ total, active, onLeave, departments: depts });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
