
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const db = require('../db');
const { HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyAuth } = require('../middleware/authentication');
const { Users } = require('../models/user.model');
const { validateRequest, updateProfileSchema } = require('../middleware/validation');

router.get('/profile', verifyAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await db.getOne(Users.findById, [userId]);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'User not found',
      message: 'User profile not found.',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(HTTP_STATUS.SUCCESS).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      auth_type: user.auth_type,
      hasPassword: Boolean(user.password),
      created_at: user.created_at,
    },
    timestamp: new Date().toISOString(),
  });
}));

router.patch('/profile', verifyAuth, validateRequest(updateProfileSchema), asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, password } = req.body;

  const user = await db.getOne(Users.findById, [userId]);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'User not found',
      message: 'User profile not found.',
      timestamp: new Date().toISOString(),
    });
  }

  const updates = {};

  if (name) {
    updates.name = name;
  }

  if (password) {
    if (user.password) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: 'Password already set',
        message: 'This account already has a password. Password changes are not supported from this endpoint.',
        timestamp: new Date().toISOString(),
      });
    }

    updates.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await db.getOne(Users.update(updates), [...Object.values(updates), userId]);

  res.status(HTTP_STATUS.SUCCESS).json({
    message: 'Profile updated successfully',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      auth_type: updatedUser.auth_type,
      hasPassword: Boolean(updatedUser.password),
      created_at: updatedUser.created_at,
    },
    timestamp: new Date().toISOString(),
  });
}));



router.get('/all', verifyAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  const users = await db.getAll(Users.getAll, [limit, offset]);

  res.status(HTTP_STATUS.SUCCESS).json({
    users: users,
    limit: limit,
    offset: offset,
    timestamp: new Date().toISOString(),
  });
}));



router.delete('/delete/:id', verifyAuth, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const requestingUserId = req.user.id;

  if (userId !== requestingUserId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Forbidden',
      message: 'You can only delete your own account.',
      timestamp: new Date().toISOString(),
    });
  }

  await db.query(Users.delete, [userId]);

  res.status(HTTP_STATUS.SUCCESS).json({
    message: 'User deleted successfully',
    timestamp: new Date().toISOString(),
  });
}));

module.exports = router;
