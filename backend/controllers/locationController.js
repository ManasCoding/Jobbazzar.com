import Location from '../models/Location.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── Get All Locations ────────────────────────────────────────────────────────

/**
 * @desc   Get all locations
 * @route  GET /api/v1/locations
 * @access Public
 */
export const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find().sort('name');
  res.json(new ApiResponse(200, locations, 'Locations fetched successfully'));
});

// ─── Create Location ──────────────────────────────────────────────────────────

/**
 * @desc   Create a new location
 * @route  POST /api/v1/locations
 * @access Private / Admin
 */
export const createLocation = asyncHandler(async (req, res) => {
  const { name, slug, city, description, latitude, longitude } = req.body;

  if (!name || !slug) throw new ApiError(400, 'Name and slug are required');

  const location = await Location.create({ name, slug, city, description, latitude, longitude });

  res.status(201).json(new ApiResponse(201, location, 'Location created successfully'));
});

// ─── Update Location ──────────────────────────────────────────────────────────

/**
 * @desc   Update a location
 * @route  PUT /api/v1/locations/:id
 * @access Private / Admin
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, 'Location not found');

  const updated = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, updated, 'Location updated successfully'));
});

// ─── Delete Location ──────────────────────────────────────────────────────────

/**
 * @desc   Delete a location
 * @route  DELETE /api/v1/locations/:id
 * @access Private / Admin
 */
export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, 'Location not found');

  await location.deleteOne();

  res.json(new ApiResponse(200, null, 'Location deleted successfully'));
});
