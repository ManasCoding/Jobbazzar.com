import Company from '../models/Company.js';
import SavedCompany from '../models/SavedCompany.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get All Companies ────────────────────────────────────────────────────────

/**
 * @desc   Get all active companies with optional filters and pagination
 * @route  GET /api/v1/companies
 * @access Public
 */
export const getAllCompanies = asyncHandler(async (req, res) => {
  const {
    search,
    industry,
    companyType,
    isHiring,
    isFeatured,
    page = 1,
    limit = 10,
    sortBy = '-createdAt',
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (industry) filter.industry = industry;
  if (companyType) filter.companyType = companyType;
  if (isHiring !== undefined) filter.isHiring = isHiring === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate('industry', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Company.countDocuments(filter),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        companies,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
      'Companies fetched successfully'
    )
  );
});

// ─── Get Single Company ───────────────────────────────────────────────────────

/**
 * @desc   Get a single company by ID
 * @route  GET /api/v1/companies/:id
 * @access Public
 */
export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('industry', 'name slug');

  if (!company) throw new ApiError(404, 'Company not found');

  res.json(new ApiResponse(200, company, 'Company fetched successfully'));
});

// ─── Create Company ───────────────────────────────────────────────────────────

/**
 * @desc   Create a new company
 * @route  POST /api/v1/companies
 * @access Private / Admin
 */
export const createCompany = asyncHandler(async (req, res) => {
  const { name, website } = req.body;
  
  // Check for duplicates
  const existingCompany = await Company.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      ...(website ? [{ website: { $regex: new RegExp(`^${website}$`, 'i') } }] : [])
    ]
  });

  if (existingCompany) {
    throw new ApiError(409, 'This company already exists.');
  }

  const company = await Company.create(req.body);

  res.status(201).json(new ApiResponse(201, company, 'Company created successfully'));
});

// ─── Update Company ───────────────────────────────────────────────────────────

/**
 * @desc   Update a company
 * @route  PUT /api/v1/companies/:id
 * @access Private / Admin
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');

  const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('industry', 'name');

  res.json(new ApiResponse(200, updated, 'Company updated successfully'));
});

// ─── Delete Company ───────────────────────────────────────────────────────────

/**
 * @desc   Delete a company
 * @route  DELETE /api/v1/companies/:id
 * @access Private / Admin
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');

  await company.deleteOne();

  res.json(new ApiResponse(200, null, 'Company deleted successfully'));
});

// ─── Save a Company ───────────────────────────────────────────────────────────

/**
 * @desc   Save a company to the user's list
 * @route  POST /api/v1/companies/:id/save
 * @access Private
 */
export const saveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');

  const exists = await SavedCompany.findOne({ user: req.user._id, company: req.params.id });
  if (exists) throw new ApiError(409, 'Company is already saved');

  const saved = await SavedCompany.create({ user: req.user._id, company: req.params.id });

  res.status(201).json(new ApiResponse(201, saved, 'Company saved successfully'));
});

// ─── Unsave a Company ─────────────────────────────────────────────────────────

/**
 * @desc   Remove a company from the user's saved list
 * @route  DELETE /api/v1/companies/:id/save
 * @access Private
 */
export const unsaveCompany = asyncHandler(async (req, res) => {
  const saved = await SavedCompany.findOneAndDelete({
    user: req.user._id,
    company: req.params.id,
  });
  if (!saved) throw new ApiError(404, 'Saved company not found');

  res.json(new ApiResponse(200, null, 'Company removed from saved list'));
});
