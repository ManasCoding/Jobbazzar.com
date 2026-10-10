import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMySavedJobs,
  saveJob,
  unsaveJob,
  getMySavedCompanies,
  getAllAdmins,
  createAdminUser,
  deleteAdminUser,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

router.route('/me').get(getMyProfile).put(updateMyProfile);

router.route('/saved-jobs').get(getMySavedJobs);
router.route('/saved-jobs/:jobId').post(saveJob).delete(unsaveJob);

router.route('/saved-companies').get(getMySavedCompanies);

// Admin Access Control routes
router
  .route('/admins')
  .get(authorizeRoles('admin'), getAllAdmins)
  .post(authorizeRoles('admin'), createAdminUser);

router
  .route('/admins/:id')
  .delete(authorizeRoles('admin'), deleteAdminUser);

export default router;

