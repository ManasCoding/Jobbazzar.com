import express from 'express';
import {
  getAllIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../controllers/industryController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getAllIndustries)                               // Public
  .post(protect, authorizeRoles('admin'), createIndustry); // Admin only

router
  .route('/:id')
  .put(protect, authorizeRoles('admin'), updateIndustry)   // Admin only
  .delete(protect, authorizeRoles('admin'), deleteIndustry); // Admin only

export default router;
