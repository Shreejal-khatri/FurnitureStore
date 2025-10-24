const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Contact = require('../model/Contact');

// -------------------- CREATE A MESSAGE (Public) --------------------
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newMessage = new Contact({ name, email, subject, message });
    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// -------------------- GET ALL MESSAGES (Admin only) --------------------
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// -------------------- DELETE MESSAGE (Admin only) --------------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;