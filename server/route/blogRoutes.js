const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Cloudinary or local multer
const Blog = require('../model/Blog');

// ---------------- CREATE (Admin only) ----------------
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, content, author, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!title || !content || !imageUrl) {
      return res.status(400).json({ message: 'Title, content, and image are required' });
    }

    const blog = await Blog.create({
      title,
      content,
      imageUrl,
      author: author || 'Admin',
      category: category || 'Other'
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
});

// ---------------- GET ALL (Public) ----------------
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// ---------------- GET SINGLE (Public) ----------------
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
});

// ---------------- UPDATE (Admin only) ----------------
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = req.file.path;

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
});

// ---------------- DELETE (Admin only) ----------------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
});

module.exports = router;