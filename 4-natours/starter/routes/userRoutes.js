import express from 'express';
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  resizeUserPhoto,
  updateMe,
  updateUser,
  uploadUserPhoto,
} from '../controllers/userController.js';
import {
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  restrictTo,
  signup,
  updatePassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
