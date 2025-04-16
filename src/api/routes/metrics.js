const express = require('express');
const router = express.Router();
const MetricsCollector = require('../../metrics/MetricsCollector');

// Get system-wide metrics
router.get('/system', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '24h';
    const metrics = await MetricsCollector.getSystemMetrics(timeRange);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get function-specific metrics
router.get('/functions/:functionId', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '24h';
    const metrics = await MetricsCollector.getFunctionMetrics(req.params.functionId, timeRange);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 