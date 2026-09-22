/**
 * Audience Consensus & Signals Aggregator
 */
import { config } from '../utils/config.js';

/**
 * Generate a visual ASCII bar chart.
 *
 * @param {number} percentage - 0 to 100
 * @param {number} width - bar width in characters
 * @returns {string}
 */
export function renderBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Build the full consensus report from analyzed comments and rubric.
 *
 * @param {Array<object>} analyzedComments - Output of analyzeComments
 * @param {object} rubric - { video_type, video_summary, criteria }
 * @param {object} videoContext - { title, channelTitle }
 * @returns {object} Aggregated stats and formatted report
 */
export function buildConsensus(analyzedComments, rubric, videoContext = {}) {
  const total = analyzedComments.length;
  if (total === 0) {
    return {
      meta: {
        videoId: videoContext.videoId || '',
        title: videoContext.title || 'Untitled',
        videoTitle: videoContext.title || 'Untitled',
        channelTitle: videoContext.channelTitle || 'Unknown',
        thumbnailUrl: videoContext.videoId
          ? `https://img.youtube.com/vi/${videoContext.videoId}/hqdefault.jpg`
          : '',
        viewCount: videoContext.viewCount || '0',
        commentCount: videoContext.commentCount || '0',
        hasTranscript: Boolean(videoContext.transcript),
        videoType: rubric.video_type || 'general',
        videoSummary: rubric.video_summary || '',
        totalAnalyzed: 0,
        opinionBearing: 0,
        opinionPercentage: 0,
      },
      typeBreakdown: {},
      criteria: [],
      signals: {
        praises: [],
        criticisms: [],
        questions: [],
        suggestions: [],
        corrections: [],
      },
    };
  }

  // 1. Layer 1 Aggregations: Opinion filtering and Comment Types
  // Jev Score is an expected value float in [0.0, 2.0]. specificity >= 0.7 captures comments
  // leaning into moderate (1.0) or high (2.0) specificity.
  const opThresh = config.consensus?.opinionThreshold ?? 0.5;
  const specThresh = config.consensus?.specificityThreshold ?? 0.7;
  const substantiveComments = analyzedComments.filter(
    (c) => c.layer1.isOpinion >= opThresh || c.layer1.specificity >= specThresh
  );

  const typeCounts = {};
  for (const c of analyzedComments) {
    const type = c.layer1.commentType || 'other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  // 2. Layer 2 Aggregations: Dynamic Rubric Consensus
  const posStanceThresh = config.consensus?.positiveStanceThreshold ?? 0.6;
  const consensusCriteria = rubric.criteria.map((criterion) => {
    const scores = substantiveComments.map((c) => c.layer2[criterion.id] ?? 0);
    const evaluatedCount = substantiveComments.length;

    // Positive stance: noul >= positiveStanceThreshold
    const supportingComments = substantiveComments.filter(
      (c) => (c.layer2[criterion.id] ?? 0) >= posStanceThresh
    );
    const positiveCount = supportingComments.length;

    // Genuine opposing comments: low criterion score AND expressing criticism/disagreement/claim
    const opposingComments = substantiveComments.filter(
      (c) =>
        (c.layer2[criterion.id] ?? 0) <= 0.35 &&
        (c.layer1.commentType === 'criticism' ||
          c.layer1.commentType === 'disagreement' ||
          c.layer1.commentType === 'correction' ||
          c.layer1.hasClaim >= 0.5)
    );
    const opposingCount = opposingComments.length;

    // Total comments actively engaging with this specific theme
    const mentionCount = positiveCount + opposingCount;

    // Global percentage across all substantive comments
    const percentage = evaluatedCount > 0 ? Math.round((positiveCount / evaluatedCount) * 100) : 0;

    // Stance ratio specifically among commenters who engaged with this topic
    const stanceRatio =
      mentionCount > 0 ? Math.round((positiveCount / mentionCount) * 100) : percentage;

    // Average confidence / intensity
    const avgScore =
      evaluatedCount > 0
        ? (scores.reduce((a, b) => a + b, 0) / evaluatedCount).toFixed(2)
        : '0.00';

    // Evidence comments for this criterion
    const supporting = supportingComments
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 6)
      .map((c) => ({
        text: c.text,
        author: c.author,
        likeCount: c.likeCount || 0,
        publishedAt: c.publishedAt,
        score: c.layer2[criterion.id],
      }));

    const opposing = opposingComments
      .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      .slice(0, 6)
      .map((c) => ({
        text: c.text,
        author: c.author,
        likeCount: c.likeCount || 0,
        publishedAt: c.publishedAt,
        score: c.layer2[criterion.id],
      }));

    return {
      id: criterion.id,
      name: criterion.name,
      question: criterion.question,
      true_criteria: criterion.true_criteria,
      false_criteria: criterion.false_criteria,
      percentage,
      stanceRatio,
      positiveCount,
      opposingCount,
      mentionCount,
      evaluatedCount,
      avgScore,
      evidence: {
        supporting,
        opposing,
      },
    };
  });

  // 3. Layer 1 Signals: Extract top comments by category
  const getTopComments = (filterFn, limit = 4) => {
    return [...analyzedComments]
      .filter(filterFn)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit)
      .map((c) => ({
        text: c.text,
        likeCount: c.likeCount,
        author: c.author,
        publishedAt: c.publishedAt,
      }));
  };

  const topPraises = getTopComments(
    (c) => c.layer1.commentType === 'praise' || c.layer1.commentType === 'agreement'
  );

  const topCriticisms = getTopComments(
    (c) => c.layer1.commentType === 'criticism' || c.layer1.commentType === 'disagreement'
  );

  const topQuestions = getTopComments(
    (c) => c.layer1.commentType === 'question'
  );

  const topSuggestions = getTopComments(
    (c) => c.layer1.commentType === 'suggestion'
  );

  const topCorrections = getTopComments(
    (c) => c.layer1.commentType === 'correction'
  );

  return {
    meta: {
      videoId: videoContext.videoId || '',
      title: videoContext.title || 'Untitled',
      videoTitle: videoContext.title || 'Untitled',
      channelTitle: videoContext.channelTitle || 'Unknown',
      thumbnailUrl: videoContext.videoId
        ? `https://img.youtube.com/vi/${videoContext.videoId}/hqdefault.jpg`
        : '',
      viewCount: videoContext.viewCount || '0',
      commentCount: videoContext.commentCount || '0',
      hasTranscript: Boolean(videoContext.transcript),
      videoType: rubric.video_type,
      videoSummary: rubric.video_summary,
      totalAnalyzed: total,
      opinionBearing: substantiveComments.length,
      opinionPercentage: Math.round((substantiveComments.length / total) * 100),
    },
    rubric: {
      videoType: rubric.video_type,
      videoSummary: rubric.video_summary,
      criteriaCount: rubric.criteria.length,
    },
    typeBreakdown: typeCounts,
    criteria: consensusCriteria,
    signals: {
      praises: topPraises,
      criticisms: topCriticisms,
      questions: topQuestions,
      suggestions: topSuggestions,
      corrections: topCorrections,
    },
  };
}

/**
 * Format the consensus object into a clean readable text report.
 *
 * @param {object} consensus
 * @returns {string}
 */
export function formatReport(consensus) {
  const { meta, typeBreakdown, criteria, signals } = consensus;
  const lines = [];

  const hr = '═'.repeat(64);
  const subhr = '─'.repeat(64);

  lines.push('');
  lines.push(hr);
  lines.push(` 📊 YOUTUBE AUDIENCE CONSENSUS REPORT`);
  lines.push(hr);
  lines.push(` Video:   ${meta.videoTitle}`);
  lines.push(` Channel: ${meta.channelTitle}`);
  lines.push(` Category: [${(meta.videoType || 'general').toUpperCase()}]`);
  lines.push(` Summary:  ${meta.videoSummary}`);
  lines.push(` Sample:   ${meta.totalAnalyzed} comments (${meta.opinionPercentage}% opinion-bearing)`);
  lines.push(subhr);

  // Section 1: Audience Verdict (Dynamic Rubric Criteria)
  lines.push('');
  lines.push(` 🎓 AUDIENCE CONSENSUS VERDICT`);
  lines.push(` (Dynamic criteria generated specifically for this video)`);
  lines.push('');

  for (const c of criteria) {
    const bar = renderBar(c.percentage, 22);
    lines.push(`  ${c.name.padEnd(28)} [${bar}] ${String(c.percentage).padStart(3)}%`);
    lines.push(`  ↳ "${c.question}"`);
    lines.push(`    Support: ${c.positiveCount}/${c.evaluatedCount} substantive comments (avg intensity: ${c.avgScore})`);
    lines.push('');
  }

  lines.push(subhr);

  // Section 2: Comment Type Breakdown
  lines.push('');
  lines.push(` 📈 AUDIENCE INTENT BREAKDOWN`);
  const typeEntries = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of typeEntries) {
    const pct = meta.totalAnalyzed > 0 ? Math.round((count / meta.totalAnalyzed) * 100) : 0;
    const bar = renderBar(pct, 12);
    lines.push(`  • ${type.padEnd(14)} : ${String(count).padStart(3)} (${pct.toString().padStart(2)}%) [${bar}]`);
  }
  lines.push('');
  lines.push(subhr);

  // Section 3: Audience Signals (Viral Key Takeaways)
  lines.push('');
  lines.push(` ⚡ AUDIENCE SIGNALS & KEY FEEDBACK`);
  lines.push(` (Ranked by audience agreement & engagement)`);

  const printCommentGroup = (title, icon, items) => {
    lines.push('');
    lines.push(` ${icon} ${title.toUpperCase()} (${items.length}):`);
    if (!items || items.length === 0) {
      lines.push(`    (None detected in this sample)`);
      return;
    }
    items.forEach((item, idx) => {
      const cleanText = (item.text || '').replace(/\n+/g, ' ').trim();
      const snippet = cleanText.length > 180 ? `${cleanText.slice(0, 180)}...` : cleanText;
      lines.push(`    ${idx + 1}. [👍 ${item.likeCount} likes] @${item.author}:`);
      lines.push(`       "${snippet}"`);
    });
  };

  printCommentGroup('Most Agreed-Upon Praise / Positive Feedback', '🔥', signals.praises);
  printCommentGroup('Most Common Criticisms & Concerns', '⚠️', signals.criticisms);
  printCommentGroup('Most Asked Questions', '❓', signals.questions);
  printCommentGroup('Top Suggestions & Feature Requests', '💡', signals.suggestions);
  if (signals.corrections && signals.corrections.length > 0) {
    printCommentGroup('Corrections & Bug Reports', '📝', signals.corrections);
  }

  lines.push('');
  lines.push(hr);
  lines.push(` End of Consensus Report`);
  lines.push(hr);
  lines.push('');

  return lines.join('\n');
}
