const express = require('express');
const router = express.Router();
const Function = require('../models/Function');

// Get all functions
router.get('/', async (req, res) => {
  try {
    const functions = await Function.find();
    res.json(functions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific function
router.get('/:id', async (req, res) => {
  try {
    const func = await Function.findById(req.params.id);
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }
    res.json(func);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new function
router.post('/', async (req, res) => {
  try {
    const func = new Function(req.body);
    await func.save();
    res.status(201).json(func);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a function
router.put('/:id', async (req, res) => {
  try {
    const func = await Function.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }
    res.json(func);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a function
router.delete('/:id', async (req, res) => {
  try {
    const func = await Function.findByIdAndDelete(req.params.id);
    if (!func) {
      return res.status(404).json({ error: 'Function not found' });
    }
    res.json({ message: 'Function deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 