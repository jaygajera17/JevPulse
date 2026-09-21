import { fetchVideoContext, fetchComments, extractVideoId } from './youtube.service.js';
import { generateRubric } from './rubric.service.js';
import { analyzeComments } from './jev.service.js';
import { buildConsensus, formatReport } from './consensus.service.js';
import { logger } from '../utils/logger.js';

/**
 * Service to orchestrate the complete YouTube comment consensus analysis pipeline.
 *
 * @param {string} videoUrl - YouTube video URL or ID
 * @param {object} options
 * @param {number} options.maxComments - Max comments to retrieve (default 200)
 * @param {boolean} options.includeRawComments - Whether to include analyzed comments array
 * @returns {Promise<object>} Complete structured consensus analysis
 */
export async function analyzeVideoConsensus(videoUrl, { maxComments = 200, includeRawComments = false } = {}) {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    throw new Error('A valid YouTube video URL or ID must be provided');
  }

  logger.info(`Starting consensus analysis pipeline for video: ${videoId}`);

  // Step 1: Fetch Video Metadata & Transcript
  const videoContext = await fetchVideoContext(videoUrl);

  // Step 2: Fetch Comments
  const { comments } = await fetchComments(videoUrl, { maxComments });

  if (!comments || comments.length === 0) {
    return {
      meta: {
        videoId,
        videoTitle: videoContext.title,
        channelTitle: videoContext.channelTitle,
        totalAnalyzed: 0,
      },
      message: 'No comments found for this video.',
      criteria: [],
      typeBreakdown: {},
      signals: {},
      reportText: 'No comments available to analyze.',
    };
  }

  // Step 3: Generate Dynamic Rubric with Gemini
  const sampleComments = comments.slice(0, 20);
  const rubric = await generateRubric(videoContext, sampleComments);

  // Step 4: Batch Analysis with Jev (Layer 1 Universal + Layer 2 Dynamic)
  const analyzed = await analyzeComments(comments, rubric, videoContext.title);

  // Step 5: Build Consensus Verdict & Audience Signals
  const consensus = buildConsensus(analyzed, rubric, videoContext);

  // Step 6: Generate Formatted Report
  const reportText = formatReport(consensus);

  return {
    ...consensus,
    reportText,
    ...(includeRawComments ? { comments: analyzed } : {}),
  };
}
