import { TypeSafeClient, noul, score, choice } from '@typesafe-ai/sdk';
import { logger } from '../utils/logger.js';

const client = new TypeSafeClient();
const BATCH_SIZE = 15;

/**
 * Split an array into chunks of a given size.
 */
function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Build the questions object for a batch of comments.
 * Combines Layer 1 (universal analysis) with Layer 2 (dynamic rubric criteria).
 */
function buildQuestions(batch, rubric) {
  const questions = {};

  for (let i = 0; i < batch.length; i++) {
    const commentRef = `\`comments[${i}].text\``;

    // --- Layer 1: Universal Questions ---

    // 1. Is this comment expressing a substantive opinion/sentiment?
    questions[`c${i}_is_opinion`] = noul({
      instructions: `Does ${commentRef} express a substantive opinion, perspective, evaluation, or personal sentiment (as opposed to spam, a timestamp, a brief greeting like "hi", or empty text)?`,
      criteria: {
        true: 'The commenter expresses a clear opinion, feeling, feedback, judgment, or question with substance.',
        false: 'A pure greeting, emoji-only, timestamp, channel link, random characters, or uninformative remark.',
      },
    });

    // 2. Primary comment category
    questions[`c${i}_comment_type`] = choice(
      `What is the primary nature or intention of ${commentRef}?`,
      {
        praise: 'Praises the creator, platform, video, or content',
        criticism: 'Expresses criticism, complaints, bugs, or dissatisfaction',
        question: 'Asks a genuine question about the video, topic, or feature',
        suggestion: 'Proposes an idea, requested feature, or suggestion for improvement',
        agreement: 'Agrees with points made in the video or with other learners',
        disagreement: 'Disagrees with a point made in the video or an opinion expressed',
        correction: 'Points out an error, typo, factual mistake, or technical issue',
        experience: 'Shares personal journey, interview experience, or learning story',
        other: 'None of the above (e.g. random remark, greeting, or unclear)',
      }
    );

    // 3. Specificity level (3-point score)
    questions[`c${i}_specificity`] = score(
      `How specific, detailed, and substantive is ${commentRef}?`,
      [
        'Vague, generic, or brief comment (e.g. "nice", "awesome", "bad")',
        'Moderately specific with some reasoning or mention of a feature/topic',
        'Highly specific with concrete details, arguments, examples, or steps',
      ]
    );

    // 4. Substantive claim or assertion
    questions[`c${i}_has_claim`] = noul({
      instructions: `Does ${commentRef} make a substantive claim, assertion, or factual statement about the video subject or platform?`,
      criteria: {
        true: 'Makes an assertion, claim, or states a fact/experience about the platform or topic.',
        false: 'Just an emotional reaction, greeting, simple exclamation, or no factual assertion.',
      },
    });

    // --- Layer 2: Dynamic Rubric Criteria ---
    for (const criterion of rubric.criteria) {
      let qText = criterion.question;
      if (/\bthis comment\b/i.test(qText)) {
        qText = qText.replace(/\bthis comment\b/gi, commentRef);
      } else {
        qText = `${qText} (Evaluate: ${commentRef})`;
      }

      questions[`c${i}_${criterion.id}`] = noul({
        instructions: qText,
      });
    }
  }

  return questions;
}

/**
 * Analyze a single batch of comments with Jev System One.
 */
async function analyzeBatch(batch, rubric, videoTitle) {
  const state = {
    video_title: videoTitle,
    video_summary: rubric.video_summary,
    comments: batch.map((c, i) => ({
      id: i,
      text: c.text,
      likes: c.likeCount,
      author: c.author,
    })),
  };

  const questions = buildQuestions(batch, rubric);
  const response = await client.systemOne({ state, questions });
  const answers = response.answers;

  return batch.map((comment, i) => {
    // Layer 1 judgments
    const layer1 = {
      isOpinion: answers[`c${i}_is_opinion`]?.noul ?? 0,
      commentType: answers[`c${i}_comment_type`]?.choice ?? 'other',
      commentTypeConfidence: answers[`c${i}_comment_type`]?.confidence ?? 0,
      specificity: answers[`c${i}_specificity`]?.score ?? 0,
      hasClaim: answers[`c${i}_has_claim`]?.noul ?? 0,
    };

    // Layer 2 judgments (dynamic rubric criteria)
    const layer2 = {};
    for (const criterion of rubric.criteria) {
      layer2[criterion.id] = answers[`c${i}_${criterion.id}`]?.noul ?? 0;
    }

    return {
      text: comment.text,
      likeCount: comment.likeCount,
      author: comment.author,
      publishedAt: comment.publishedAt,
      layer1,
      layer2,
    };
  });
}

/**
 * Analyze all comments in batches using Jev System One.
 *
 * @param {Array<{text: string, likeCount: number, author: string, publishedAt: string}>} comments
 * @param {{video_type: string, video_summary: string, criteria: Array}} rubric
 * @param {string} videoTitle
 * @returns {Promise<Array<{text: string, likeCount: number, author: string, layer1: object, layer2: object}>>}
 */
export async function analyzeComments(comments, rubric, videoTitle = 'Unknown Video') {
  const batches = chunk(comments, BATCH_SIZE);
  const allResults = [];

  logger.info(`Analyzing ${comments.length} comments in ${batches.length} batches with Jev (Layer 1 + Layer 2)...`);

  for (let i = 0; i < batches.length; i++) {
    logger.debug(`Processing batch ${i + 1}/${batches.length} (${batches[i].length} comments)...`);
    const results = await analyzeBatch(batches[i], rubric, videoTitle);
    allResults.push(...results);
  }

  logger.info(`Jev analysis complete: evaluated ${allResults.length} comments`);
  return allResults;
}
