import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RUBRIC_SYSTEM_PROMPT = `You analyze YouTube videos and generate an analysis rubric for evaluating audience comments.

Given the video title, description, transcript excerpt, and sample comments, produce a JSON object with:
- "video_type": A short label (e.g. "technical_tutorial", "comedy", "product_review", "podcast", "educational_announcement", "gaming", "vlog")
- "video_summary": One clear sentence describing what the video is about
- "criteria": An array of 3 to 6 analysis criteria

Each criterion in the "criteria" array MUST follow this exact schema:
{
  "id": "snake_case_identifier",
  "name": "Human Readable Label (2-4 words)",
  "question": "A yes/no question answerable from a single comment. MUST contain the phrase 'this comment'. For example: 'Does this comment praise the new website design?' or 'Does this comment express frustration with the changes?'",
  "true_criteria": "A concise description of what qualifies as a YES (e.g. 'Explicitly praises the UI, layout, or design aesthetic')",
  "false_criteria": "A concise description of what qualifies as a NO (e.g. 'Complains about the design, discusses unrelated topics, or is neutral')",
  "type": "noul",
  "aggregation": "percentage"
}

Rules for criteria:
1. Every question MUST be answerable from an INDIVIDUAL comment alone (no cross-comment comparison).
2. Every question MUST contain the phrase "this comment".
3. Questions must be SPECIFIC to this video's actual topic, claims, features, jokes, or controversies — NOT generic questions like "Is this a positive comment?" or "Is this comment helpful?".
4. Pick criteria where audience agreement or disagreement matters (e.g. support vs opposition to a change, technical accuracy, humor appreciation, shared frustration, specific feature feedback).
5. All criteria type MUST be "noul" and aggregation MUST be "percentage".
6. Every criterion MUST include concise "true_criteria" and "false_criteria" descriptions that define clear, unambiguous decision boundaries for the question.`;

/**
 * Validate and sanitize the rubric returned by Gemini.
 */
function validateRubric(rubric) {
  if (!rubric || typeof rubric !== 'object') {
    throw new Error('Rubric is not a valid JSON object');
  }

  if (!rubric.video_type || typeof rubric.video_type !== 'string') {
    rubric.video_type = 'general';
  }

  if (!rubric.video_summary || typeof rubric.video_summary !== 'string') {
    rubric.video_summary = 'YouTube video content analysis';
  }

  if (!Array.isArray(rubric.criteria) || rubric.criteria.length === 0) {
    throw new Error('Rubric criteria must be a non-empty array');
  }

  rubric.criteria = rubric.criteria.slice(0, 6).map((c, index) => {
    let id = (c.id || `criterion_${index + 1}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    let name = c.name || `Criterion ${index + 1}`;
    let question = c.question || '';

    // Ensure question includes "this comment"
    if (!question.toLowerCase().includes('this comment')) {
      question = question.trim();
      if (question.endsWith('?')) {
        question = `According to this comment, ${question.charAt(0).toLowerCase() + question.slice(1)}`;
      } else {
        question = `Does this comment indicate that ${question}?`;
      }
    }

    return {
      id,
      name,
      question,
      true_criteria: c.true_criteria || `The comment clearly affirms or demonstrates: ${name}`,
      false_criteria: c.false_criteria || `The comment does not affirm, disagrees with, or is irrelevant to: ${name}`,
      type: 'noul',
      aggregation: 'percentage',
    };
  });

  return rubric;
}

/**
 * Generate a dynamic analysis rubric using Gemini.
 *
 * @param {object} videoContext - { title, description, transcript, channelTitle }
 * @param {Array<{text: string}>} sampleComments - Array of sample comments (e.g. first 20)
 * @returns {Promise<{video_type: string, video_summary: string, criteria: Array}>}
 */
export async function generateRubric(videoContext, sampleComments = []) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  logger.info('Generating dynamic rubric with Gemini...');

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const sampleCommentsText = sampleComments
    .slice(0, config.rubric.sampleCommentsCount)
    .map((c, i) => `[Comment ${i + 1}]: "${c.text.replace(/\n+/g, ' ').slice(0, 200)}"`)
    .join('\n');

  const userPrompt = `VIDEO DETAILS:
Channel: ${videoContext.channelTitle || 'Unknown'}
Title: ${videoContext.title || 'Untitled'}

Description:
${(videoContext.description || 'None').slice(0, 1500)}

Transcript Excerpt:
${videoContext.transcript || '(No transcript available)'}

Sample Comments:
${sampleCommentsText || '(No comments provided)'}

Generate the dynamic analysis rubric as JSON according to the instructions.`;

  const candidateModels = config.rubric?.candidateModels || [
    'gemini-3.5-flash-lite',
  ];
  let lastError = null;

  for (const model of candidateModels) {
    try {
      logger.debug(`Calling Gemini model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: `${RUBRIC_SYSTEM_PROMPT}\n\n${userPrompt}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(responseText);
      const validated = validateRubric(parsed);

      logger.info(`Rubric generated successfully (type: "${validated.video_type}", criteria: ${validated.criteria.length})`);
      return validated;
    } catch (err) {
      logger.warn(`Gemini model ${model} failed: ${err.message?.slice(0, 120)}`);
      lastError = err;
      if (err.message?.includes('503') || err.message?.includes('fetch failed')) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  logger.warn(`Gemini API unavailable (${lastError?.message?.slice(0, 80)}). Using tailored fallback rubric.`);
  return getFallbackRubric(videoContext);
}

/**
 * Generate a smart fallback rubric based on video metadata.
 */
function getFallbackRubric(videoContext) {
  const title = (videoContext.title || '').toLowerCase();
  const desc = (videoContext.description || '').toLowerCase();
  const combined = `${title} ${desc}`;

  if (combined.includes('prep') || combined.includes('platform') || combined.includes('placement') || combined.includes('dsa') || combined.includes('course')) {
    return {
      video_type: 'tech_education_platform',
      video_summary: videoContext.title || 'Tech placement preparation and learning platform announcement',
      criteria: [
        {
          id: 'platform_enthusiasm',
          name: 'Platform Enthusiasm',
          question: 'Does this comment express enthusiasm, gratitude, or praise for the new platform or features?',
          true_criteria: 'Expresses clear enthusiasm, excitement, gratitude, or praise for the platform, features, or course.',
          false_criteria: 'Criticizes the platform, reports issues, asks unrelated questions, or lacks positive sentiment.',
          type: 'noul',
          aggregation: 'percentage',
        },
        {
          id: 'content_transition_concern',
          name: 'Content / Sheet Concerns',
          question: 'Does this comment express concern, worry, or criticism regarding previous free resources, sheets, or changes?',
          true_criteria: 'Expresses concern, worry, skepticism, or complaint regarding free resource changes or platform transitions.',
          false_criteria: 'Happy with changes, unconcerned about previous resources, or discussing other topics.',
          type: 'noul',
          aggregation: 'percentage',
        },
        {
          id: 'feature_or_bug_feedback',
          name: 'Feature or Bug Feedback',
          question: 'Does this comment point out a bug, issue, or suggest a specific feature for the website?',
          true_criteria: 'Points out a bug, glitch, UX issue, or suggests a specific feature or improvement.',
          false_criteria: 'General commentary or praise without any bug report or feature request.',
          type: 'noul',
          aggregation: 'percentage',
        },
        {
          id: 'recommendation_intent',
          name: 'Recommendation Intent',
          question: 'Does this comment recommend this creator or platform to other learners and peers?',
          true_criteria: 'Recommends the creator or platform to peers, or states it is essential for learning.',
          false_criteria: 'Does not recommend the platform or discourages others from using it.',
          type: 'noul',
          aggregation: 'percentage',
        },
      ],
    };
  }

  return {
    video_type: 'general_video',
    video_summary: videoContext.title || 'YouTube video content',
    criteria: [
      {
        id: 'content_appreciation',
        name: 'Content Appreciation',
        question: 'Does this comment express appreciation or positive sentiment towards the video content?',
        true_criteria: 'Expresses positive sentiment, enjoyment, thanks, or praise for the video content.',
        false_criteria: 'Neutral, critical, unappreciative, or off-topic remark.',
        type: 'noul',
        aggregation: 'percentage',
      },
      {
        id: 'critical_feedback',
        name: 'Critical Feedback',
        question: 'Does this comment express disagreement, criticism, or critique of the points made in the video?',
        true_criteria: 'Expresses disagreement, criticism, disappointment, or identifies flaws in the video.',
        false_criteria: 'Agrees with the video, offers praise, or makes neutral remarks.',
        type: 'noul',
        aggregation: 'percentage',
      },
      {
        id: 'audience_engagement',
        name: 'Audience Engagement',
        question: 'Does this comment actively discuss the core topic or ask an insightful follow-up question?',
        true_criteria: 'Actively discusses the core subject matter, shares relevant thoughts, or asks an insightful question.',
        false_criteria: 'Superficial greeting, spam, timestamp only, or off-topic remark.',
        type: 'noul',
        aggregation: 'percentage',
      },
    ],
  };
}
