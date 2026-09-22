import { analyzeVideoConsensus } from '../services/analysis.service.js';
import { extractVideoId } from '../services/youtube.service.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

/**
 * Controller for YouTube comment consensus analysis.
 */
export async function analyzeVideo(req, res, next) {
  try {
    const { url, videoUrl, link, videoId: inputVideoId, includeRawComments } = req.body || {};

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

    const parsedMax = req.body?.maxComments
      ? Number(req.body.maxComments)
      : config.maxComments;

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

/**
 * SSE controller for real-time analysis streaming.
 */
export async function streamAnalysis(req, res) {
  const { url, videoUrl, link, videoId: inputVideoId } = req.query || {};
  const rawUrl = url || videoUrl || link || inputVideoId;

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: "Missing required query parameter: 'url'",
    });
  }

  const videoId = extractVideoId(rawUrl.trim());
  if (!videoId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid YouTube video URL or ID provided.',
    });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isClosed = false;
  req.on('close', () => {
    isClosed = true;
    logger.info(`SSE client disconnected for video: ${videoId}`);
  });

  const sendEvent = (event) => {
    if (!isClosed) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  };

  try {
    const parsedMax = req.query?.maxComments
      ? Number(req.query.maxComments)
      : config.maxComments;

    logger.info(`Starting SSE analysis stream for video: ${videoId} (maxComments: ${parsedMax})`);
    await analyzeVideoConsensus(rawUrl.trim(), {
      maxComments: parsedMax,
      includeRawComments: false,
      onProgress: (event) => {
        sendEvent(event);
      },
    });

    if (!isClosed) {
      res.end();
    }
  } catch (error) {
    logger.error('Stream analysis error:', error);
    sendEvent({
      type: 'ERROR',
      message: error.message || 'Analysis failed',
    });
    if (!isClosed) {
      res.end();
    }
  }
}
