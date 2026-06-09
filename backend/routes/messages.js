const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

// System messages / notifications
const systemMessages = [
  { id: 1, type: 'W', text: 'Payroll run scheduled for 30-JUN-2026. Pending approval: 3 purchase orders.' },
  { id: 2, type: 'I', text: 'Monthly financial closing in progress. Period 6 open.' },
  { id: 3, type: 'E', text: '2 materials below reorder point. Review stock levels.' },
];

router.get('/', (req, res) => {
  res.json(systemMessages);
});

module.exports = router;
