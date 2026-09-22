import { fetchVideoContext, fetchComments, extractVideoId } from './youtube.service.js';
import { generateRubric } from './rubric.service.js';
import { analyzeComments } from './jev.service.js';
import { buildConsensus, formatReport } from './consensus.service.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

/**
 * Service to orchestrate the complete YouTube comment consensus analysis pipeline.
 *
 * @param {string} videoUrl - YouTube video URL or ID
 * @param {object} options
 * @param {boolean} options.includeRawComments - Whether to include analyzed comments array
 * @returns {Promise<object>} Complete structured consensus analysis
 */
export async function analyzeVideoConsensus(
  videoUrl,
  {
    maxComments = config.maxComments,
    batchSize = config.jev.batchSize,
    concurrency = config.jev.concurrency,
    includeRawComments = false,
    onProgress,
  } = {}
) {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    throw new Error('A valid YouTube video URL or ID must be provided');
  }

  logger.info(`Starting consensus analysis pipeline for video: ${videoId}`);

  // Step 1 & 2: Fetch Video Metadata & Comments in parallel
  logger.info(`Fetching video metadata and comments in parallel for: ${videoId}`);

  const videoContextPromise = fetchVideoContext(videoUrl).then((ctx) => {
    if (typeof onProgress === 'function') {
      onProgress({
        type: 'METADATA_READY',
        videoId,
        title: ctx.title,
        description: ctx.description,
        channelTitle: ctx.channelTitle,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        viewCount: ctx.viewCount || '0',
        commentCount: ctx.commentCount || '0',
        hasTranscript: Boolean(ctx.transcript),
      });
    }
    return ctx;
  });

  const commentsPromise = fetchComments(videoUrl, { maxComments }).then((res) => {
    if (typeof onProgress === 'function') {
      onProgress({
        type: 'COMMENTS_READY',
        count: res.comments ? res.comments.length : 0,
      });
    }
    return res;
  });

  const [videoContext, { comments }] = await Promise.all([
    videoContextPromise,
    commentsPromise,
  ]);

  if (!comments || comments.length === 0) {
    const emptyResult = {
      meta: {
        videoId,
        videoTitle: videoContext.title,
        channelTitle: videoContext.channelTitle,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        viewCount: videoContext.viewCount || '0',
        commentCount: videoContext.commentCount || '0',
        totalAnalyzed: 0,
        opinionBearing: 0,
        opinionPercentage: 0,
      },
      message: 'No comments found for this video.',
      criteria: [],
      typeBreakdown: {},
      signals: {},
      reportText: 'No comments available to analyze.',
    };

    if (typeof onProgress === 'function') {
      onProgress({
        type: 'COMPLETE',
        ...emptyResult,
      });
    }

    return emptyResult;
  }

  // Step 3: Generate Dynamic Rubric with Gemini
  const sampleComments = comments.slice(0, config.rubric.sampleCommentsCount);
  const rubric = await generateRubric(videoContext, sampleComments);

  if (typeof onProgress === 'function') {
    onProgress({
      type: 'RUBRIC_READY',
      video_type: rubric.video_type,
      video_summary: rubric.video_summary,
      criteria: rubric.criteria,
    });
  }

  // Step 4: Batch Analysis with Jev 
  const analyzed = await analyzeComments(comments, rubric, videoContext.title, {
    batchSize,
    concurrency,
    onBatchProgress: (batchInfo) => {
      if (typeof onProgress === 'function') {
        onProgress({
          type: 'ANALYSIS_PROGRESS',
          ...batchInfo,
        });
      }
    },
  });

  // Step 5: Build Consensus Verdict & Audience Signals
  const consensus = buildConsensus(analyzed, rubric, videoContext);

  // Step 6: Generate Formatted Report
  const reportText = formatReport(consensus);

  const fullResult = {
    ...consensus,
    reportText,
    ...(includeRawComments ? { comments: analyzed } : {}),
  };

  if (typeof onProgress === 'function') {
    onProgress({
      type: 'COMPLETE',
      ...fullResult,
    });
  }

  return fullResult;
}
