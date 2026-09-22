import 'dotenv/config';

/**
 * Global Configuration & Constants for Video Consensus Analysis
 *
 * Edit the default values here or override them via environment variables in .env.
 */
export const config = {
  /**
   * Maximum number of YouTube comments to fetch and analyze for a video.
   * - If a video has fewer comments than this limit (e.g. video has 45 comments and maxComments is 200),
   *   all available comments are analyzed as-is without error or truncation.
   * - If a video has more comments than this limit, fetching stops once maxComments is reached.
   */
  maxComments: Number(process.env.MAX_COMMENTS) || 5000,

  /**
   * YouTube comment fetching options
   */
  youtube: {
    /**
     * Include nested replies in comment threads (true by default).
     */
    includeReplies: process.env.YOUTUBE_INCLUDE_REPLIES !== 'false',

    /**
     * Comment ordering: 'relevance' (highest engagement) or 'time' (newest first).
     */
    order: process.env.YOUTUBE_COMMENT_ORDER || 'relevance',

    /**
     * If 'relevance' hits YouTube's 500-thread ceiling before maxComments is reached,
     * continue fetching remaining comments using 'time' ordering.
     */
    fallbackToTimeOrder: true,
  },

  /**
   * Jev System One batch processing settings
   */
  jev: {
    /**
     * Number of comments per batch sent to Jev System One.
     * Recommended: 10 - 20.
     */
    batchSize: Number(process.env.JEV_BATCH_SIZE) || 50,

    /**
     * Number of concurrent batch evaluation workers in flight.
     * Keeps total pipeline execution fast while respecting rate limits.
     */
    concurrency: Number(process.env.JEV_CONCURRENCY) || 25,
  },

  /**
   * Dynamic rubric generation settings (Gemini)
   */
  rubric: {
    /**
     * Number of sample comments passed to Gemini to understand video context & tone
     */
    sampleCommentsCount: Number(process.env.RUBRIC_SAMPLE_COMMENTS) || 30,

    /**
     * Maximum characters of video transcript passed to Gemini
     */
    maxTranscriptChars: Number(process.env.MAX_TRANSCRIPT_CHARS) || 3000,

    /**
     * Candidate Gemini models for rubric generation
     */
    candidateModels: ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash'],
  },

  /**
   * Consensus & audience signal filtering thresholds
   */
  consensus: {
    opinionThreshold: 0.5,
    specificityThreshold: 0.7,
    positiveStanceThreshold: 0.6,
  },
};

export default config;
