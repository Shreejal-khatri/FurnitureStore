const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../model/User");


//Get all users - Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

//Delete a user - Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});


// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update current user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { username, phone, address } = req.body;

    // Build update object (only include fields that were sent)
    const updateFields = {};
    if (username !== undefined) updateFields.username = username;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;