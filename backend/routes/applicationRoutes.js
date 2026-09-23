import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, applyForJob);
router.get('/me', protect, getMyApplications);

// Admin routes
router.get('/job/:jobId', protect, authorizeRoles('admin'), getApplicationsForJob);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateApplicationStatus);

export default router;
