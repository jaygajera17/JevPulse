import { analyzeVideoConsensus } from '../services/analysis.service.js';
import { extractVideoId } from '../services/youtube.service.js';
import { logger } from '../utils/logger.js';

/**
 * Controller for YouTube comment consensus analysis.
 */
export async function analyzeVideo(req, res, next) {
  try {
    const { url, videoUrl, link, videoId: inputVideoId, maxComments, includeRawComments } = req.body || {};

    const rawUrl = url || videoUrl || link || inputVideoId;

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: 'url' (YouTube video link or video ID).",
      });
    }

    const videoId = extractVideoId(rawUrl.trim());
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube video URL or ID provided.',
      });
    }

    // Parse & clamp maxComments if specified
    const parsedMax = Number.isInteger(Number(maxComments)) ? Math.max(1, Math.min(500, Number(maxComments))) : 200;

    logger.info(`Received analysis request for video: ${videoId} (maxComments: ${parsedMax})`);

    const result = await analyzeVideoConsensus(rawUrl.trim(), {
      maxComments: parsedMax,
      includeRawComments: Boolean(includeRawComments),
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Analysis controller error:', error);
    next(error);
  }
}
