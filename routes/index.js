import express from 'express';
import branchRoutes from './masterdata/branchRoutes.js';
import departmentRoutes from './masterdata/departmentRoutes.js';
import productRoutes from './masterdata/productRoutes.js';
import slaRoutes from './masterdata/slaRoutes.js';
import ticketTitleRoutes from './masterdata/ticketTitleRoutes.js';

const router = express.Router();

router.use('/masterdata/branches', branchRoutes);
router.use('/masterdata/departments', departmentRoutes);
router.use('/masterdata/products', productRoutes);
router.use('/masterdata/slas', slaRoutes);
router.use('/masterdata/ticket-titles', ticketTitleRoutes);

export default router;