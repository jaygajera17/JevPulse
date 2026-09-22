import 'dotenv/config';
import { fetchTranscript } from 'youtube-transcript';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const COMMENT_THREADS_URL = 'https://www.googleapis.com/youtube/v3/commentThreads';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

/**
 * Extract YouTube video ID from various URL formats or bare IDs.
 * Supports: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
 *
 * @param {string} urlOrId
 * @returns {string}
 */
export function extractVideoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return '';

  const clean = urlOrId.trim();

  // Already a bare 11-char ID
  if (/^[\w-]{11}$/.test(clean)) return clean;

  try {
    const url = new URL(clean);

    // youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1).split('/')[0] || clean;
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = url.searchParams.get('v');
    if (v) return v;

    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.pathname.match(/\/embed\/([\w-]+)/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.pathname.match(/\/shorts\/([\w-]+)/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    // Return as-is
  }

  return clean;
}

/**
 * Fetch video metadata (title, description, channelTitle) from YouTube Data API.
 *
 * @param {string} videoUrlOrId
 * @returns {Promise<{videoId: string, title: string, description: string, channelTitle: string}>}
 */
export async function fetchVideoMetadata(videoUrlOrId) {
  const videoId = extractVideoId(videoUrlOrId);

  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set in environment variables');
  }

  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: videoId,
    key: YOUTUBE_API_KEY,
  });

  const res = await fetch(`${VIDEOS_URL}?${params}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `YouTube API error ${res.status}: ${err?.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) {
    throw new Error(`YouTube video not found for ID: ${videoId}`);
  }

  return {
    videoId,
    title: item.snippet.title || '',
    description: item.snippet.description || '',
    channelTitle: item.snippet.channelTitle || '',
    viewCount: item.statistics?.viewCount || '0',
    commentCount: item.statistics?.commentCount || '0',
  };
}

/**
 * Fetch video context: metadata and optional transcript excerpt.
 *
 * @param {string} videoUrlOrId
 * @param {object} options
 * @param {number} options.maxTranscriptChars
 * @returns {Promise<{videoId: string, title: string, description: string, channelTitle: string, transcript: string}>}
 */
export async function fetchVideoContext(
  videoUrlOrId,
  { maxTranscriptChars = config.rubric.maxTranscriptChars } = {}
) {
  const videoId = extractVideoId(videoUrlOrId);
  logger.info(`Fetching video context for ID: ${videoId}`);

  const metadata = await fetchVideoMetadata(videoUrlOrId);

  let transcript = '';
  try {
    const items = await fetchTranscript(videoId);
    if (items && items.length > 0) {
      const fullText = items.map((item) => item.text).join(' ');
      transcript = fullText.slice(0, maxTranscriptChars);
      logger.debug(`Transcript fetched: ${items.length} segments (~${transcript.length} chars)`);
    }
  } catch (err) {
    logger.debug(`Transcript unavailable for ${videoId}: ${err.message || 'no captions'}`);
  }

  return {
    videoId,
    title: metadata.title,
    description: metadata.description,
    channelTitle: metadata.channelTitle,
    viewCount: metadata.viewCount,
    commentCount: metadata.commentCount,
    transcript,
  };
}

/**
 * Fetch comments from a YouTube video, including nested thread replies if enabled.
 *
 * @param {string} videoUrlOrId
 * @param {object} options
 * @param {number} [options.maxComments]
 * @param {boolean} [options.includeReplies]
 * @param {string} [options.order]
 * @param {boolean} [options.fallbackToTimeOrder]
 * @returns {Promise<{videoId: string, comments: Array<{text: string, likeCount: number, publishedAt: string, author: string, isReply?: boolean}>}>}
 */
export async function fetchComments(
  videoUrlOrId,
  {
    maxComments = config.maxComments,
    includeReplies = config.youtube?.includeReplies ?? true,
    order = config.youtube?.order ?? 'relevance',
    fallbackToTimeOrder = config.youtube?.fallbackToTimeOrder ?? true,
  } = {}
) {
  const videoId = extractVideoId(videoUrlOrId);

  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set in environment variables');
  }

  const comments = [];
  const seenIds = new Set();
  const part = includeReplies ? 'snippet,replies' : 'snippet';

  logger.info(
    `Fetching comments for video ${videoId} (limit: ${maxComments}, replies: ${includeReplies}, order: ${order})...`
  );

  async function fetchPages(sortOrder) {
    let pageToken = null;

    while (comments.length < maxComments) {
      const params = new URLSearchParams({
        part,
        videoId,
        key: YOUTUBE_API_KEY,
        maxResults: String(Math.min(100, maxComments - comments.length)),
        order: sortOrder,
        textFormat: 'plainText',
      });

      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      const res = await fetch(`${COMMENT_THREADS_URL}?${params}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          `YouTube Comments API error ${res.status}: ${err?.error?.message || res.statusText}`
        );
      }

      const data = await res.json();
      const items = data.items || [];
      if (items.length === 0) break;

      for (const item of items) {
        // 1. Top-level comment
        const top = item.snippet?.topLevelComment;
        if (top && !seenIds.has(top.id)) {
          seenIds.add(top.id);
          const snippet = top.snippet;
          if (snippet?.textDisplay) {
            comments.push({
              id: top.id,
              text: snippet.textDisplay,
              likeCount: snippet.likeCount || 0,
              publishedAt: snippet.publishedAt,
              author: snippet.authorDisplayName,
              isReply: false,
            });
            if (comments.length >= maxComments) break;
          }
        }

        // 2. Nested thread replies
        if (includeReplies && item.replies?.comments) {
          for (const reply of item.replies.comments) {
            if (reply && !seenIds.has(reply.id)) {
              seenIds.add(reply.id);
              const snippet = reply.snippet;
              if (snippet?.textDisplay) {
                comments.push({
                  id: reply.id,
                  text: snippet.textDisplay,
                  likeCount: snippet.likeCount || 0,
                  publishedAt: snippet.publishedAt,
                  author: snippet.authorDisplayName,
                  isReply: true,
                });
                if (comments.length >= maxComments) break;
              }
            }
          }
        }
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }
  }

  // 1. Fetch with primary order (e.g. relevance)
  await fetchPages(order);

  // 2. If relevance stops at YouTube's 500 cap and maxComments is still not reached,
  // continue with 'time' order to fetch additional comments
  if (order === 'relevance' && fallbackToTimeOrder && comments.length < maxComments) {
    logger.info(
      `Primary 'relevance' fetch reached ${comments.length} comments; continuing with 'time' ordering to reach limit (${maxComments})...`
    );
    await fetchPages('time');
  }

  logger.info(`Fetched ${comments.length} comments for video ${videoId}`);
  return { videoId, comments };
}
