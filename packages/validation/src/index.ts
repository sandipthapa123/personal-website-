import { z } from 'zod';
import { ContentStatus } from '@cms/constants';

export const LoginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const PageQuerySchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  locale: z.string().default('en'),
});

export type PageQueryInput = z.infer<typeof PageQuerySchema>;

export const CreatePageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required'),
  layoutId: z.string().uuid('Layout ID must be a valid UUID'),
  locale: z.string().default('en'),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  seoMetadata: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    openGraphImage: z.string().optional(),
  }).optional(),
});

export type CreatePageInput = z.infer<typeof CreatePageSchema>;

export const HeroBlockPropsSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().optional(),
  avatarUrl: z.string().optional(),
  ctaPrimary: z.object({
    text: z.string(),
    url: z.string(),
  }).optional(),
  ctaSecondary: z.object({
    text: z.string(),
    url: z.string(),
  }).optional(),
});

export type HeroBlockPropsInput = z.infer<typeof HeroBlockPropsSchema>;
