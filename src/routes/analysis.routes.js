import { Router } from 'express';
import { analyzeVideo, streamAnalysis } from '../controllers/analysis.controller.js';

const router = Router();

/**
 * @route   GET /analyze/stream (or /api/analyze/stream)
 * @desc    Stream YouTube comment consensus analysis in real-time via SSE
 * @access  Public
 */
router.get('/analyze/stream', streamAnalysis);

/**
 * @route   POST /analyze (or /api/analyze)
 * @desc    Analyze YouTube comments and generate dynamic consensus report
 * @access  Public (No auth required)
 */
router.post('/analyze', analyzeVideo);

export default router;
