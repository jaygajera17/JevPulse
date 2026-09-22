# JevPulse

Scores every comment on a YouTube video individually instead of summarizing
the thread with an LLM.

Paste a video URL → get per-comment judgments (opinion or noise, intent,
stance on a handful of video-specific criteria) aggregated into a consensus
report: % agreement per topic, top praise/criticism/questions ranked by
likes, an opinion-vs-noise split.



## Pipeline

1. **Rubric generation (Gemini, one call).** Reads the video's title,
   description, transcript, and ~20 sample comments, and generates 3-6
   yes/no criteria specific to that video — e.g. for a coding tutorial:
   *"Does this comment praise the code clarity?"* Hardcoded categories
   don't hold up across video types, so this step is per-video.

2. **Scoring (Jev, batched + concurrent).** Every comment gets ~10 typed
   questions: is it substantive, what type (praise/criticism/question/...),
   how specific, plus one question per rubric criterion. Jev evaluates
   state + all questions in one parallel pass per batch — no token-by-token
   generation, so latency scales with request count, not question count.

3. **Aggregation (plain code, no model).** Percentages, agreement counts,
   top comments per category — deterministic, no LLM in this step.