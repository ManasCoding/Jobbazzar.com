import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getAllJobs)                             // Public — list with filters
  .post(protect, authorizeRoles('admin'), createJob); // Admin only

router
  .route('/:id')
  .get(getJobById)                            // Public
  .put(protect, authorizeRoles('admin'), updateJob)   // Admin only
  .delete(protect, authorizeRoles('admin'), deleteJob); // Admin only

export default router;
