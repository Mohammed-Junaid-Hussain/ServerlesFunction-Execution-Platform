const express = require('express');
const router = express.Router();
const Function = require('../models/Function');
const { executeFunction } = require('../../core/executor');

// Execute a function
router.post('/:functionId', async (req, res) => {
  try {
    // Log the request body to verify the input format
    console.log('Request Body:', req.body); // Add this log to inspect the input

    const func = await Function.findById(req.params.functionId);
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }

    // Ensure input is a valid object
    const input = req.body.input || {};

    // Log the function data and input for debugging
    console.log('Function:', func);
    console.log('Input:', input);

    const result = await executeFunction(func, input);

    // Log the result of function execution
    console.log('Execution Result:', result);

    // Send the result as JSON response
    res.json(result);
  } catch (error) {
    // Log any error that occurs
    console.error('Error executing function:', error);
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
