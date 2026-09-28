import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  saveCompany,
  unsaveCompany,
  getCompanySuggestions,
} from '../controllers/companyController.js';
import { fetchCompanyData } from '../controllers/fetchCompanyInfo.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Fetch company data dynamically (public Gemini / scraper API)
router.post('/fetch', fetchCompanyData);

// Auto-suggestions around Bhubaneswar (must be before /:id)
router.get('/suggestions', getCompanySuggestions);

router
  .route('/')
  .get(getAllCompanies)                               // Public
  .post(protect, authorizeRoles('admin'), createCompany); // Admin protected

router
  .route('/:id')
  .get(getCompanyById)                              // Public
  .put(protect, authorizeRoles('admin'), updateCompany)  // Admin only
  .delete(protect, authorizeRoles('admin'), deleteCompany); // Admin only

// Save / unsave a company (any logged-in user)
router.route('/:id/save').post(protect, saveCompany).delete(protect, unsaveCompany);

export default router;
