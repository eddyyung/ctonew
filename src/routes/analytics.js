const express = require('express');
const { z } = require('zod');
const { requireApiKey } = require('../middleware/requireApiKey');
const { getTrendingVideos, searchVideos } = require('../services/youtubeService');
const { obfuscateTitle } = require('../utils/obfuscate');

const router = express.Router();

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 31;

const dateRangeSchema = z
  .object({
    startDate: z.coerce.date({
      invalid_type_error: 'startDate is required.',
      invalid_date_error: 'startDate must be a valid ISO date.',
    }),
    endDate: z.coerce.date({
      invalid_type_error: 'endDate is required.',
      invalid_date_error: 'endDate must be a valid ISO date.',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endDate must be on or after startDate.',
        path: ['endDate'],
      });
    }

    const diffDays = Math.floor((data.endDate - data.startDate) / ONE_DAY_MS);
    if (diffDays > MAX_RANGE_DAYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Date range cannot exceed ${MAX_RANGE_DAYS} days.`,
        path: ['endDate'],
      });
    }
  });

const searchSchema = z.object({
  keyword: z
    .string({
      required_error: 'keyword is required.',
      invalid_type_error: 'keyword must be a string.',
    })
    .trim()
    .min(2, 'keyword must contain at least 2 characters.')
    .max(80, 'keyword cannot exceed 80 characters.'),
});

const formatValidationIssues = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

const buildBubbleSeries = (videos) =>
  videos.map((video) => ({
    id: video.id,
    label: video.title,
    x: video.metrics.views,
    y: video.metrics.likes,
    radius: Math.max(6, Math.round(Math.sqrt((video.metrics.comments || 0) + 1))),
    metadata: {
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
    },
  }));

const buildTopVideos = (videos) =>
  videos.slice(0, 10).map((video, index) => ({
    rank: index + 1,
    id: video.id,
    title: video.title,
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt,
    duration: video.duration,
    metrics: video.metrics,
  }));

router.post('/trending', requireApiKey, async (req, res) => {
  const parseResult = dateRangeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'Invalid date range payload.',
      details: formatValidationIssues(parseResult.error.issues),
    });
  }

  const { startDate, endDate } = parseResult.data;

  try {
    const videos = await getTrendingVideos({
      apiKey: req.session.apiKey,
      startDate,
      endDate,
    });

    const sortedVideos = [...videos].sort((a, b) => {
      if (b.metrics.views !== a.metrics.views) {
        return b.metrics.views - a.metrics.views;
      }
      return b.metrics.likes - a.metrics.likes;
    });

    const bubbleSeries = buildBubbleSeries(sortedVideos);
    const topVideos = buildTopVideos(sortedVideos);

    return res.json({
      range: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      bubbleSeries: {
        axes: {
          x: 'views',
          y: 'likes',
          radius: 'comments',
        },
        data: bubbleSeries,
      },
      topVideos,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'internal_error',
      message: 'Unable to retrieve trending analytics at this time.',
    });
  }
});

router.post('/search', requireApiKey, async (req, res) => {
  const parseResult = searchSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'Invalid search payload.',
      details: formatValidationIssues(parseResult.error.issues),
    });
  }

  const { keyword } = parseResult.data;

  try {
    const videos = await searchVideos({
      apiKey: req.session.apiKey,
      keyword,
      limit: 10,
    });

    const obfuscatedVideos = videos.map((video) => ({
      id: video.id,
      title: obfuscateTitle(video.title),
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      duration: video.duration,
      metrics: video.metrics,
    }));

    return res.json({
      keyword,
      count: obfuscatedVideos.length,
      videos: obfuscatedVideos,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'internal_error',
      message: 'Unable to perform analytics search at this time.',
    });
  }
});

module.exports = router;
