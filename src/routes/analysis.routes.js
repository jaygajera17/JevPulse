import { Router } from 'express';
import { analyzeVideo } from '../controllers/analysis.controller.js';

const router = Router();

/**
 * @route   POST /analyze (or /api/analyze)
 * @desc    Analyze YouTube comments and generate dynamic consensus report
 * @access  Public (No auth required)
 */
router.post('/analyze', analyzeVideo);

export default router;
