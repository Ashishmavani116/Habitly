const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    // Convert Map to plain object for JSON response
    const habitsJson = habits.map(h => ({
      _id: h._id,
      name: h.name,
      emoji: h.emoji,
      color: h.color,
      streak: h.streak,
      history: Object.fromEntries(h.history),
      createdAt: h.createdAt
    }));
    res.json(habitsJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new habit
router.post('/', async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    const habit = new Habit({ name, emoji, color });
    await habit.save();
    res.status(201).json({
      _id: habit._id,
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      streak: habit.streak,
      history: {},
      createdAt: habit.createdAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update habit (name, emoji, color)
router.put('/:id', async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { name, emoji, color },
      { new: true }
    );
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json({
      _id: habit._id,
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      streak: habit.streak,
      history: Object.fromEntries(habit.history),
      createdAt: habit.createdAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH toggle today's habit check-in
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { date } = req.body; // expects "YYYY-MM-DD"
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    // Toggle the date
    const current = habit.history.get(date) || false;
    habit.history.set(date, !current);

    // Recalculate streak
    const doneDates = [];
    habit.history.forEach((val, key) => { if (val) doneDates.push(key); });
    doneDates.sort();

    let streak = 0;
    if (doneDates.length > 0) {
      streak = 1;
      for (let i = doneDates.length - 1; i > 0; i--) {
        const a = new Date(doneDates[i]);
        const b = new Date(doneDates[i - 1]);
        if ((a - b) / 86400000 === 1) streak++;
        else break;
      }
    }
    habit.streak = streak;
    await habit.save();

    res.json({
      _id: habit._id,
      name: habit.name,
      emoji: habit.emoji,
      color: habit.color,
      streak: habit.streak,
      history: Object.fromEntries(habit.history),
      createdAt: habit.createdAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
