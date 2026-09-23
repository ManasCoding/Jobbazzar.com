import express from 'express';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getAllLocations)                               // Public
  .post(protect, authorizeRoles('admin'), createLocation); // Admin only

router
  .route('/:id')
  .put(protect, authorizeRoles('admin'), updateLocation)   // Admin only
  .delete(protect, authorizeRoles('admin'), deleteLocation); // Admin only

export default router;
