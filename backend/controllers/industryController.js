import Industry from '../models/Industry.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get All Industries ───────────────────────────────────────────────────────

/**
 * @desc   Get all industries
 * @route  GET /api/v1/industries
 * @access Public
 */
export const getAllIndustries = asyncHandler(async (req, res) => {
  const industries = await Industry.find().sort('name');
  res.json(new ApiResponse(200, industries, 'Industries fetched successfully'));
});

// ─── Create Industry ──────────────────────────────────────────────────────────

/**
 * @desc   Create a new industry
 * @route  POST /api/v1/industries
 * @access Private / Admin
 */
export const createIndustry = asyncHandler(async (req, res) => {
  const { name, description, slug } = req.body;

  if (!name || !slug) throw new ApiError(400, 'Name and slug are required');

  const industry = await Industry.create({ name, description, slug });

  res.status(201).json(new ApiResponse(201, industry, 'Industry created successfully'));
});

// ─── Update Industry ──────────────────────────────────────────────────────────

/**
 * @desc   Update an industry
 * @route  PUT /api/v1/industries/:id
 * @access Private / Admin
 */
export const updateIndustry = asyncHandler(async (req, res) => {
  const industry = await Industry.findById(req.params.id);
  if (!industry) throw new ApiError(404, 'Industry not found');

  const updated = await Industry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, updated, 'Industry updated successfully'));
});

// ─── Delete Industry ──────────────────────────────────────────────────────────

/**
 * @desc   Delete an industry
 * @route  DELETE /api/v1/industries/:id
 * @access Private / Admin
 */
export const deleteIndustry = asyncHandler(async (req, res) => {
  const industry = await Industry.findById(req.params.id);
  if (!industry) throw new ApiError(404, 'Industry not found');

  await industry.deleteOne();

  res.json(new ApiResponse(200, null, 'Industry deleted successfully'));
});
