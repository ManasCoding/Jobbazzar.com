import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  saveCompany,
  unsaveCompany,
} from '../controllers/companyController.js';
import { fetchCompanyData } from '../controllers/fetchCompanyInfo.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Fetch company data dynamically (public Clearbit API — no auth needed)
router.post('/fetch', fetchCompanyData);

router
  .route('/')
  .get(getAllCompanies)                               // Public
  .post(protect, authorizeRoles('admin'), createCompany); // Now protected for admins

router
  .route('/:id')
  .get(getCompanyById)                              // Public
  .put(protect, authorizeRoles('admin'), updateCompany)  // Admin only
  .delete(protect, authorizeRoles('admin'), deleteCompany); // Admin only

// Save / unsave a company (any logged-in user)
router.route('/:id/save').post(protect, saveCompany).delete(protect, unsaveCompany);

export default router;
