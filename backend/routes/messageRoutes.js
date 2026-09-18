const express = require('express');
const router = express.Router();
const {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/messageController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route: client submits contact message
router.post('/', createMessage);

// Protected admin routes: consultation, status change, deletion
router.get('/', protect, admin, getMessages);
router.patch('/:id/status', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
