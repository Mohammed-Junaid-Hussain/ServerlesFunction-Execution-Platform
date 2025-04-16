const express = require('express');
const router = express.Router();
const Function = require('../models/Function');
const { executeFunction } = require('../../core/executor');

// Execute a function
router.post('/:functionId', async (req, res) => {
  try {
    const func = await Function.findById(req.params.functionId);
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }

    const input = req.body.input || {};
    
    const result = await executeFunction(func, input);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution history (to be implemented with metrics)
router.get('/:functionId/history', async (req, res) => {
  try {
    const func = await Function.findById(req.params.functionId);
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }

    // TODO: Implement execution history retrieval
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 