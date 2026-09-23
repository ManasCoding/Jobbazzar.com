/**
 * routes/index.js
 * Central route aggregator.
 * Mount all sub-routers here — server.js only imports this single file.
 */
import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import jobRoutes from './jobRoutes.js';
import companyRoutes from './companyRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import industryRoutes from './industryRoutes.js';
import locationRoutes from './locationRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);
router.use('/applications', applicationRoutes);
router.use('/industries', industryRoutes);
router.use('/locations', locationRoutes);

export default router;
