const express = require('express');
const router = express.Router();
const { BackgroundJob } = require('../models/Workbench');
const { protect } = require('../middleware/auth');

router.use(protect);

// SM37 - Job Overview
router.get('/', async (req, res) => {
  try {
    const { status, user } = req.query;
    let query = {};
    if (status) query.status = status;
    if (user) query.createdBy = user.toUpperCase();
    const jobs = await BackgroundJob.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await BackgroundJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const job = await BackgroundJob.create({ ...req.body, createdBy: req.user.username, scheduledAt: new Date() });

    // Simulate job execution after 2 seconds
    setTimeout(async () => {
      try {
        job.status = 'Running';
        job.startedAt = new Date();
        await job.save();
        setTimeout(async () => {
          job.status = Math.random() > 0.1 ? 'Finished' : 'Error';
          job.finishedAt = new Date();
          job.duration = Math.floor(Math.random() * 10) + 1;
          job.spoolOutput = [`Job ${job.jobName} started at ${job.startedAt}`, `Program: ${job.programName}`, `Execution completed in ${job.duration}s`, `Job finished with status: ${job.status}`];
          await job.save();
        }, 3000);
      } catch (e) {}
    }, 1000);

    res.status(201).json({ message: `Job ${job.jobName} scheduled`, job });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const job = await BackgroundJob.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
    res.json({ message: `Job cancelled`, job });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// SM50 - Work Process overview (simulated)
router.get('/system/processes', async (req, res) => {
  const processes = [
    { wp: 0, type: 'DIA', pid: 12341, status: 'Waiting', action: '-', client: '100', user: '', program: '', table: '' },
    { wp: 1, type: 'DIA', pid: 12342, status: 'Running', action: 'ABAP', client: '100', user: req.user.username, program: 'SAPLSMTR_NAVIGATION', table: 'USR02' },
    { wp: 2, type: 'DIA', pid: 12343, status: 'Waiting', action: '-', client: '100', user: '', program: '', table: '' },
    { wp: 3, type: 'UPD', pid: 12344, status: 'Waiting', action: '-', client: '', user: '', program: '', table: '' },
    { wp: 4, type: 'BGD', pid: 12345, status: 'Running', action: 'ABAP', client: '100', user: 'BTCUSR', program: 'RSBDCSUB', table: '' },
    { wp: 5, type: 'ENQ', pid: 12346, status: 'Waiting', action: '-', client: '', user: '', program: '', table: '' },
    { wp: 6, type: 'SPO', pid: 12347, status: 'Waiting', action: '-', client: '', user: '', program: '', table: '' },
  ];
  res.json({ processes, serverName: 'ERPSRV01', instance: 'ERP_00', time: new Date() });
});

module.exports = router;
