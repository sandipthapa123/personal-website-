import { z } from 'zod';
import { ContentStatus } from '@cms/constants';

export const LoginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Shared password strength policy — reused by reset-password, change-password, and
// accept-invite so every path that ever sets a password enforces the same rule.
export const PasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Must be a valid email address'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: PasswordSchema,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: PasswordSchema,
});
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

export const CreateUserInviteSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).default('PENDING'),
});
export type CreateUserInviteInput = z.infer<typeof CreateUserInviteSchema>;

export const Verify2faSchema = z.object({
  code: z.string().min(6, 'Enter the 6-digit code').max(10),
});
export type Verify2faInput = z.infer<typeof Verify2faSchema>;

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
