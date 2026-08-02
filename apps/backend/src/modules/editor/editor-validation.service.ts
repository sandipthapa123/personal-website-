import { Injectable, BadRequestException } from '@nestjs/common';
import { getBlockDefinition, getAllBlockTypes, IBlockDefinitionSchema } from './block-schema.registry';

export interface IWcagIssue {
  blockId: string;
  blockType: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  wcagCriteria?: string;
}

export interface IWcagValidationResult {
  valid: boolean;
  canPublish: boolean;
  errors: IWcagIssue[];
  warnings: IWcagIssue[];
  infos: IWcagIssue[];
  score: number; // 0-100
}

@Injectable()
export class EditorValidationService {

  validateBlockArray(blocks: any[]): IWcagValidationResult {
    const errors: IWcagIssue[] = [];
    const warnings: IWcagIssue[] = [];
    const infos: IWcagIssue[] = [];
    let h1Count = 0;
    let lastHeadingLevel = 0;

    for (const block of blocks) {
      const def = getBlockDefinition(block.type);

      // ── Required field validation ─────────────────────────────────
      if (def) {
        for (const [field, schema] of Object.entries(def.propSchema)) {
          if (schema.required && (block.props[field] === undefined || block.props[field] === null || block.props[field] === '')) {
            errors.push({
              blockId: block.id,
              blockType: block.type,
              severity: 'error',
              message: `Required field "${schema.label}" is missing.`,
              field,
              wcagCriteria: schema.wcagNote,
            });
          }
          if (schema.wcagRequired && !block.props[field]) {
            errors.push({
              blockId: block.id,
              blockType: block.type,
              severity: 'error',
              message: `WCAG 2.2 AAA: "${schema.label}" is required. ${schema.wcagNote || ''}`,
              field,
              wcagCriteria: '1.1.1 Non-text Content',
            });
          }
        }
      }

      // ── Image validation ──────────────────────────────────────────
      if (block.type === 'IMAGE') {
        if (!block.props.decorative && (!block.props.alt || block.props.alt.trim() === '')) {
          errors.push({
            blockId: block.id,
            blockType: 'IMAGE',
            severity: 'error',
            message: 'WCAG 1.1.1: Non-decorative image requires descriptive alt text.',
            field: 'alt',
            wcagCriteria: 'WCAG 2.2 AAA — 1.1.1 Non-text Content',
          });
        }
        if (block.props.alt && block.props.alt.toLowerCase().includes('image of ')) {
          warnings.push({
            blockId: block.id,
            blockType: 'IMAGE',
            severity: 'warning',
            message: 'Alt text should not start with "image of" — screen readers announce the image role automatically.',
            field: 'alt',
          });
        }
        if (block.props.alt && block.props.alt.length > 150) {
          warnings.push({
            blockId: block.id,
            blockType: 'IMAGE',
            severity: 'warning',
            message: 'Alt text exceeds 150 characters. Consider a shorter description and use a caption for additional detail.',
            field: 'alt',
          });
        }
      }

      // ── Gallery validation ────────────────────────────────────────
      if (block.type === 'GALLERY' && Array.isArray(block.props.images)) {
        block.props.images.forEach((img: any, idx: number) => {
          if (!img.alt || img.alt.trim() === '') {
            errors.push({
              blockId: block.id,
              blockType: 'GALLERY',
              severity: 'error',
              message: `WCAG 1.1.1: Gallery image #${idx + 1} is missing alt text.`,
              wcagCriteria: '1.1.1 Non-text Content',
            });
          }
        });
      }

      // ── Heading validation ────────────────────────────────────────
      if (block.type === 'HEADING') {
        const level = parseInt(block.props.level || '2', 10);
        if (level === 1) h1Count++;
        if (h1Count > 1) {
          errors.push({
            blockId: block.id,
            blockType: 'HEADING',
            severity: 'error',
            message: 'WCAG 2.4.6: Only one H1 is allowed per page.',
            field: 'level',
            wcagCriteria: '2.4.6 Headings and Labels',
          });
        }
        if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
          warnings.push({
            blockId: block.id,
            blockType: 'HEADING',
            severity: 'warning',
            message: `Heading hierarchy skips from H${lastHeadingLevel} to H${level}. Heading levels should not be skipped.`,
            field: 'level',
            wcagCriteria: '1.3.1 Info and Relationships',
          });
        }
        lastHeadingLevel = level;
        if (!block.props.text || block.props.text.trim() === '') {
          errors.push({
            blockId: block.id,
            blockType: 'HEADING',
            severity: 'error',
            message: 'Heading must not be empty.',
            field: 'text',
          });
        }
      }

      // ── Table validation ──────────────────────────────────────────
      if (block.type === 'TABLE') {
        if (!block.props.caption) {
          warnings.push({
            blockId: block.id,
            blockType: 'TABLE',
            severity: 'warning',
            message: 'WCAG 1.3.1: Tables should have a caption to describe their purpose.',
            field: 'caption',
            wcagCriteria: '1.3.1 Info and Relationships',
          });
        }
        if (!block.props.headers || block.props.headers.length === 0) {
          errors.push({
            blockId: block.id,
            blockType: 'TABLE',
            severity: 'error',
            message: 'WCAG 1.3.1: Table must have header row to define column structure.',
            field: 'headers',
            wcagCriteria: '1.3.1 Info and Relationships',
          });
        }
      }

      // ── Embed / iframe validation ─────────────────────────────────
      if (block.type === 'EMBED') {
        if (!block.props.title || block.props.title.trim() === '') {
          errors.push({
            blockId: block.id,
            blockType: 'EMBED',
            severity: 'error',
            message: 'WCAG 4.1.2: Embedded iframe must have a descriptive title attribute.',
            field: 'title',
            wcagCriteria: '4.1.2 Name, Role, Value',
          });
        }
      }

      // ── Link validation within rich text ─────────────────────────
      if (block.type === 'RICH_TEXT' && block.props.html) {
        const badLinks = ['click here', 'read more', 'here', 'link', 'this link'];
        // Simple check — full parse would need HTML parser
        badLinks.forEach((phrase) => {
          if (block.props.html.toLowerCase().includes(`>${phrase}<`)) {
            warnings.push({
              blockId: block.id,
              blockType: 'RICH_TEXT',
              severity: 'warning',
              message: `WCAG 2.4.4: Avoid generic link text like "${phrase}". Use descriptive link labels.`,
              wcagCriteria: '2.4.4 Link Purpose',
            });
          }
        });
      }

      // ── Video / Audio accessibility ───────────────────────────────
      if (block.type === 'VIDEO' && block.props.autoplay && !block.props.muted) {
        errors.push({
          blockId: block.id,
          blockType: 'VIDEO',
          severity: 'error',
          message: 'WCAG 1.4.2: Autoplay videos with audio must be muted by default or have user control.',
          field: 'autoplay',
          wcagCriteria: '1.4.2 Audio Control',
        });
      }

      // ── Contact form ──────────────────────────────────────────────
      if (block.type === 'CONTACT_FORM') {
        infos.push({
          blockId: block.id,
          blockType: 'CONTACT_FORM',
          severity: 'info',
          message: 'Verify all form fields have visible labels and error messages are announced via aria-live.',
          wcagCriteria: '1.3.1, 4.1.2',
        });
      }
    }

    const errorCount = errors.length;
    const warningCount = warnings.length;
    const totalBlocks = blocks.length || 1;
    const score = Math.max(0, Math.round(100 - (errorCount * 20) - (warningCount * 5)));

    return {
      valid: errorCount === 0,
      canPublish: errorCount === 0,
      errors,
      warnings,
      infos,
      score,
    };
  }

  validateSingleBlock(block: any): IWcagValidationResult {
    return this.validateBlockArray([block]);
  }

  validateContent(content: string, contentType: 'html' | 'markdown' | 'text'): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!content || content.trim().length === 0) {
      issues.push('Content cannot be empty.');
    }
    if (contentType === 'html' && content && content.length > 500000) {
      issues.push('HTML content exceeds 500KB limit. Consider splitting into multiple blocks.');
    }
    return { valid: issues.length === 0, issues };
  }
}
