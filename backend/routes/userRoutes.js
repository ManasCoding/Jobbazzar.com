import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMySavedJobs,
  saveJob,
  unsaveJob,
  getMySavedCompanies,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All user routes are protected
router.use(protect);

router.route('/me').get(getMyProfile).put(updateMyProfile);

router.route('/saved-jobs').get(getMySavedJobs);
router.route('/saved-jobs/:jobId').post(saveJob).delete(unsaveJob);

router.route('/saved-companies').get(getMySavedCompanies);

export default router;
