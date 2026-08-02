/**
 * Block Schema Registry
 * Defines 40+ block types with their prop schemas, defaults, WCAG requirements,
 * and Editor.js tool mappings. This is the single source of truth for all
 * content block types in the enterprise CMS.
 */

export interface IBlockPropSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'richtext' | 'media' | 'url' | 'color' | 'enum' | 'html';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: string[]; // for enum type
  min?: number;
  max?: number;
  wcagRequired?: boolean; // if true, publish is blocked without this field
  wcagNote?: string;
}

export interface IBlockDefinitionSchema {
  type: string;
  name: string;
  category: 'text' | 'media' | 'layout' | 'interactive' | 'academic' | 'embed' | 'navigation' | 'content';
  description: string;
  icon: string; // emoji or icon name
  editorjsTool?: string; // Editor.js tool class name if applicable
  propSchema: Record<string, IBlockPropSchema>;
  defaultProps: Record<string, any>;
  allowedRegions: string[];
  supportsChildren?: boolean;
  wcagRequirements?: string[];
  version: number;
}

export const BLOCK_SCHEMA_REGISTRY: Record<string, IBlockDefinitionSchema> = {

  // ─── TEXT & FORMATTING ───────────────────────────────────────────────────

  RICH_TEXT: {
    type: 'RICH_TEXT',
    name: 'Rich Text',
    category: 'text',
    description: 'Full rich text block with inline formatting (bold, italic, underline, color, links)',
    icon: '📝',
    editorjsTool: 'Paragraph',
    propSchema: {
      html: { type: 'html', label: 'Content (HTML)', required: true, wcagRequired: false },
      delta: { type: 'object', label: 'Editor.js Delta', description: 'Raw Editor.js block data' },
      markdown: { type: 'string', label: 'Markdown version' },
      plainText: { type: 'string', label: 'Plain text version' },
      locale: { type: 'enum', label: 'Language', options: ['en', 'ne', 'hi', 'fr', 'de'], default: 'en' },
      textAlign: { type: 'enum', label: 'Text alignment', options: ['left', 'center', 'right', 'justify'], default: 'left' },
      fontSize: { type: 'string', label: 'Font size', description: 'e.g. 1rem, 18px' },
      lineHeight: { type: 'string', label: 'Line height', description: 'e.g. 1.6, 24px' },
    },
    defaultProps: { html: '<p>Start typing here...</p>', locale: 'en', textAlign: 'left' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  HEADING: {
    type: 'HEADING',
    name: 'Heading',
    category: 'text',
    description: 'H1–H6 semantic headings with optional anchor ID',
    icon: '🔤',
    editorjsTool: 'Header',
    propSchema: {
      text: { type: 'string', label: 'Heading text', required: true, wcagRequired: true, wcagNote: 'Heading text must be descriptive' },
      level: { type: 'enum', label: 'Heading level', options: ['1', '2', '3', '4', '5', '6'], required: true, default: '2', wcagRequired: true, wcagNote: 'H1 must appear only once per page' },
      anchorId: { type: 'string', label: 'Anchor ID', description: 'For in-page navigation links' },
      textAlign: { type: 'enum', label: 'Alignment', options: ['left', 'center', 'right'], default: 'left' },
    },
    defaultProps: { text: 'Section Heading', level: '2', textAlign: 'left' },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Heading hierarchy must not skip levels', 'H1 appears once per page'],
    version: 1,
  },

  PARAGRAPH: {
    type: 'PARAGRAPH',
    name: 'Paragraph',
    category: 'text',
    description: 'Simple paragraph block with text alignment and spacing',
    icon: '¶',
    propSchema: {
      text: { type: 'richtext', label: 'Text content', required: true },
      textAlign: { type: 'enum', label: 'Alignment', options: ['left', 'center', 'right', 'justify'], default: 'left' },
      fontSize: { type: 'string', label: 'Font size' },
      color: { type: 'color', label: 'Text color' },
      background: { type: 'color', label: 'Background color' },
      indent: { type: 'number', label: 'Indentation level', min: 0, max: 5, default: 0 },
    },
    defaultProps: { text: 'Enter your paragraph text here.', textAlign: 'left' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  QUOTE: {
    type: 'QUOTE',
    name: 'Block Quote',
    category: 'text',
    description: 'Block quote or pull quote with optional attribution',
    icon: '❝',
    editorjsTool: 'Quote',
    propSchema: {
      text: { type: 'richtext', label: 'Quote text', required: true },
      attribution: { type: 'string', label: 'Author / Source' },
      attributionUrl: { type: 'url', label: 'Attribution URL' },
      variant: { type: 'enum', label: 'Style', options: ['blockquote', 'pullquote', 'testimonial'], default: 'blockquote' },
      align: { type: 'enum', label: 'Alignment', options: ['left', 'center'], default: 'left' },
    },
    defaultProps: { text: 'Quote text here.', variant: 'blockquote', align: 'left' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  CODE_BLOCK: {
    type: 'CODE_BLOCK',
    name: 'Code Block',
    category: 'text',
    description: 'Syntax-highlighted code block with language selection',
    icon: '</> ',
    editorjsTool: 'CodeTool',
    propSchema: {
      code: { type: 'string', label: 'Code content', required: true },
      language: { type: 'enum', label: 'Language', options: ['javascript', 'typescript', 'python', 'bash', 'json', 'html', 'css', 'sql', 'java', 'go', 'rust', 'c', 'cpp', 'php', 'ruby', 'yaml', 'markdown', 'plaintext'], default: 'javascript' },
      caption: { type: 'string', label: 'Caption / filename' },
      showLineNumbers: { type: 'boolean', label: 'Show line numbers', default: true },
      highlightLines: { type: 'string', label: 'Highlight lines', description: 'e.g. 1-3, 5, 8' },
    },
    defaultProps: { code: '// Your code here', language: 'javascript', showLineNumbers: true },
    allowedRegions: ['main'],
    version: 1,
  },

  CALLOUT: {
    type: 'CALLOUT',
    name: 'Callout / Alert',
    category: 'text',
    description: 'Info, warning, success, error, or tip callout box',
    icon: '💡',
    editorjsTool: 'Warning',
    propSchema: {
      title: { type: 'string', label: 'Callout title', required: true },
      message: { type: 'richtext', label: 'Callout body', required: true },
      variant: { type: 'enum', label: 'Style', options: ['info', 'warning', 'success', 'error', 'tip', 'note', 'important', 'caution'], default: 'info', required: true },
      icon: { type: 'string', label: 'Override icon emoji' },
      dismissible: { type: 'boolean', label: 'Can be dismissed', default: false },
    },
    defaultProps: { title: 'Note', message: 'Important information here.', variant: 'info', dismissible: false },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Icon must have aria-label or be aria-hidden with text visible'],
    version: 1,
  },

  DIVIDER: {
    type: 'DIVIDER',
    name: 'Horizontal Divider',
    category: 'text',
    description: 'Horizontal rule with style options',
    icon: '―',
    editorjsTool: 'Delimiter',
    propSchema: {
      style: { type: 'enum', label: 'Line style', options: ['solid', 'dashed', 'dotted', 'double', 'ornamental'], default: 'solid' },
      color: { type: 'color', label: 'Color' },
      spacing: { type: 'enum', label: 'Spacing', options: ['sm', 'md', 'lg', 'xl'], default: 'md' },
    },
    defaultProps: { style: 'solid', spacing: 'md' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  SPACER: {
    type: 'SPACER',
    name: 'Spacer',
    category: 'text',
    description: 'Vertical whitespace block',
    icon: '↕',
    propSchema: {
      height: { type: 'enum', label: 'Height', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'], default: 'md' },
      customHeight: { type: 'string', label: 'Custom height (CSS)', description: 'e.g. 64px, 4rem' },
    },
    defaultProps: { height: 'md' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  // ─── LISTS ───────────────────────────────────────────────────────────────

  ORDERED_LIST: {
    type: 'ORDERED_LIST',
    name: 'Ordered List',
    category: 'text',
    description: 'Numbered list with optional nesting',
    icon: '🔢',
    editorjsTool: 'NestedList',
    propSchema: {
      items: { type: 'array', label: 'List items', required: true, description: 'Array of {text, children[]}' },
      style: { type: 'enum', label: 'Counter style', options: ['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'], default: 'decimal' },
    },
    defaultProps: { items: [{ text: 'First item' }, { text: 'Second item' }], style: 'decimal' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  UNORDERED_LIST: {
    type: 'UNORDERED_LIST',
    name: 'Unordered List',
    category: 'text',
    description: 'Bullet list with optional nesting',
    icon: '•',
    editorjsTool: 'NestedList',
    propSchema: {
      items: { type: 'array', label: 'List items', required: true },
      markerStyle: { type: 'enum', label: 'Marker style', options: ['disc', 'circle', 'square', 'none'], default: 'disc' },
    },
    defaultProps: { items: [{ text: 'First item' }, { text: 'Second item' }], markerStyle: 'disc' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  CHECKLIST: {
    type: 'CHECKLIST',
    name: 'Checklist',
    category: 'text',
    description: 'Interactive or static checklist',
    icon: '☑',
    editorjsTool: 'Checklist',
    propSchema: {
      items: { type: 'array', label: 'Checklist items', required: true, description: 'Array of {text, checked}' },
      interactive: { type: 'boolean', label: 'Interactive (users can check)', default: false },
    },
    defaultProps: { items: [{ text: 'Task one', checked: false }, { text: 'Task two', checked: true }], interactive: false },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Each checkbox must have an accessible label'],
    version: 1,
  },

  DEFINITION_LIST: {
    type: 'DEFINITION_LIST',
    name: 'Definition List',
    category: 'text',
    description: 'DL/DT/DD semantic definition list',
    icon: '📖',
    propSchema: {
      items: { type: 'array', label: 'Definition pairs', required: true, description: 'Array of {term, definition}' },
    },
    defaultProps: { items: [{ term: 'Term', definition: 'Definition text here.' }] },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  // ─── MEDIA ───────────────────────────────────────────────────────────────

  IMAGE: {
    type: 'IMAGE',
    name: 'Image',
    category: 'media',
    description: 'Responsive image with alt text, caption, and figure markup',
    icon: '🖼',
    editorjsTool: 'ImageTool',
    propSchema: {
      src: { type: 'url', label: 'Image URL or Media Library ID', required: true },
      alt: { type: 'string', label: 'Alt text', required: true, wcagRequired: true, wcagNote: 'Alt text is required for all images. Use empty string only for decorative images.' },
      caption: { type: 'richtext', label: 'Caption' },
      width: { type: 'number', label: 'Width (px)', description: 'Leave blank for full width' },
      height: { type: 'number', label: 'Height (px)' },
      alignment: { type: 'enum', label: 'Alignment', options: ['left', 'center', 'right', 'full-width'], default: 'center' },
      linkUrl: { type: 'url', label: 'Link URL (click to open)' },
      loading: { type: 'enum', label: 'Loading strategy', options: ['lazy', 'eager'], default: 'lazy' },
      decorative: { type: 'boolean', label: 'Decorative image (no alt needed)', default: false },
    },
    defaultProps: { alt: '', alignment: 'center', loading: 'lazy', decorative: false },
    allowedRegions: ['main', 'sidebar', 'header'],
    wcagRequirements: ['Non-decorative images require descriptive alt text', 'Contrast between text overlays and image must be 7:1'],
    version: 1,
  },

  GALLERY: {
    type: 'GALLERY',
    name: 'Image Gallery',
    category: 'media',
    description: 'Multi-image gallery with lightbox, masonry or grid layout',
    icon: '🎨',
    propSchema: {
      images: { type: 'array', label: 'Images', required: true, description: 'Array of {src, alt, caption}' },
      layout: { type: 'enum', label: 'Layout', options: ['grid', 'masonry', 'carousel', 'slideshow'], default: 'grid' },
      columns: { type: 'enum', label: 'Columns', options: ['2', '3', '4'], default: '3' },
      lightbox: { type: 'boolean', label: 'Enable lightbox', default: true },
      caption: { type: 'string', label: 'Gallery caption / figcaption' },
    },
    defaultProps: { images: [], layout: 'grid', columns: '3', lightbox: true },
    allowedRegions: ['main'],
    wcagRequirements: ['Each image must have alt text', 'Lightbox must be keyboard accessible'],
    version: 1,
  },

  VIDEO: {
    type: 'VIDEO',
    name: 'Video',
    category: 'media',
    description: 'HTML5 video player or YouTube/Vimeo embed',
    icon: '🎬',
    propSchema: {
      src: { type: 'url', label: 'Video URL (mp4, YouTube, Vimeo)', required: true },
      poster: { type: 'url', label: 'Poster image URL' },
      caption: { type: 'string', label: 'Caption' },
      autoplay: { type: 'boolean', label: 'Autoplay', default: false, wcagNote: 'Autoplay must be muted if enabled' },
      controls: { type: 'boolean', label: 'Show controls', default: true },
      loop: { type: 'boolean', label: 'Loop', default: false },
      muted: { type: 'boolean', label: 'Muted', default: false },
      aspectRatio: { type: 'enum', label: 'Aspect ratio', options: ['16/9', '4/3', '1/1', '9/16'], default: '16/9' },
      transcriptUrl: { type: 'url', label: 'Transcript URL', wcagNote: 'Provide transcript for accessibility' },
    },
    defaultProps: { autoplay: false, controls: true, loop: false, muted: false, aspectRatio: '16/9' },
    allowedRegions: ['main'],
    wcagRequirements: ['Videos with audio must have captions', 'Autoplay content must have a pause mechanism'],
    version: 1,
  },

  AUDIO: {
    type: 'AUDIO',
    name: 'Audio Player',
    category: 'media',
    description: 'HTML5 audio player with transcript support',
    icon: '🎙',
    propSchema: {
      src: { type: 'url', label: 'Audio URL (mp3, ogg, wav)', required: true },
      title: { type: 'string', label: 'Track title', required: true, wcagRequired: true },
      caption: { type: 'string', label: 'Caption' },
      transcriptUrl: { type: 'url', label: 'Transcript URL', wcagNote: 'Transcript is strongly recommended' },
      transcriptText: { type: 'richtext', label: 'Inline transcript' },
    },
    defaultProps: { title: 'Audio track' },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Audio content must have a transcript'],
    version: 1,
  },

  DOCUMENT: {
    type: 'DOCUMENT',
    name: 'Document / File Download',
    category: 'media',
    description: 'PDF viewer or file download card',
    icon: '📄',
    editorjsTool: 'AttachesTool',
    propSchema: {
      fileUrl: { type: 'url', label: 'File URL', required: true },
      filename: { type: 'string', label: 'Display filename', required: true },
      fileType: { type: 'enum', label: 'File type', options: ['pdf', 'docx', 'xlsx', 'pptx', 'zip', 'csv', 'json', 'other'], default: 'pdf' },
      fileSize: { type: 'string', label: 'File size', description: 'e.g. 2.4 MB' },
      description: { type: 'string', label: 'Description' },
      inlinePreview: { type: 'boolean', label: 'Show inline PDF preview', default: false },
    },
    defaultProps: { fileType: 'pdf', inlinePreview: false },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  // ─── LAYOUT BLOCKS ──────────────────────────────────────────────────────

  COLUMNS: {
    type: 'COLUMNS',
    name: 'Columns Layout',
    category: 'layout',
    description: '2–4 column layout container, each column holds nested blocks',
    icon: '⧉',
    supportsChildren: true,
    propSchema: {
      count: { type: 'enum', label: 'Number of columns', options: ['2', '3', '4'], required: true, default: '2' },
      gap: { type: 'enum', label: 'Column gap', options: ['none', 'sm', 'md', 'lg'], default: 'md' },
      stackOnMobile: { type: 'boolean', label: 'Stack on mobile', default: true },
      columnWidths: { type: 'string', label: 'Custom widths', description: 'e.g. "1fr 2fr" for 2 cols' },
      columns: { type: 'array', label: 'Column block arrays', description: 'Array of block arrays for each column' },
    },
    defaultProps: { count: '2', gap: 'md', stackOnMobile: true, columns: [[], []] },
    allowedRegions: ['main'],
    version: 1,
  },

  TABLE: {
    type: 'TABLE',
    name: 'Table',
    category: 'layout',
    description: 'Responsive, accessible table with header rows, captions, and styled cells',
    icon: '📊',
    editorjsTool: 'Table',
    propSchema: {
      caption: { type: 'string', label: 'Table caption', wcagNote: 'Caption is recommended for accessible tables' },
      headers: { type: 'array', label: 'Header row', description: 'Array of header cell strings' },
      rows: { type: 'array', label: 'Data rows', required: true, description: 'Array of row arrays' },
      hasFooter: { type: 'boolean', label: 'Has footer row', default: false },
      footerRow: { type: 'array', label: 'Footer row cells' },
      striped: { type: 'boolean', label: 'Striped rows', default: true },
      bordered: { type: 'boolean', label: 'Cell borders', default: true },
      responsive: { type: 'boolean', label: 'Horizontally scrollable on mobile', default: true },
      alignment: { type: 'enum', label: 'Cell text alignment', options: ['left', 'center', 'right'], default: 'left' },
    },
    defaultProps: { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['Cell', 'Cell', 'Cell']], striped: true, bordered: true, responsive: true },
    allowedRegions: ['main'],
    wcagRequirements: ['Table must have a caption or summary', 'Header cells must use <th> with scope attribute'],
    version: 1,
  },

  ACCORDION: {
    type: 'ACCORDION',
    name: 'Accordion',
    category: 'layout',
    description: 'Keyboard-accessible expand/collapse panels',
    icon: '🪗',
    propSchema: {
      items: { type: 'array', label: 'Accordion panels', required: true, description: 'Array of {title, content, defaultOpen}' },
      allowMultiple: { type: 'boolean', label: 'Allow multiple open', default: false },
      variant: { type: 'enum', label: 'Style', options: ['default', 'bordered', 'filled', 'ghost'], default: 'default' },
    },
    defaultProps: { items: [{ title: 'Panel 1', content: 'Panel content here.', defaultOpen: true }], allowMultiple: false, variant: 'default' },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Accordion buttons must manage aria-expanded', 'Panels must use role="region" and aria-labelledby'],
    version: 1,
  },

  TABS: {
    type: 'TABS',
    name: 'Tabs',
    category: 'layout',
    description: 'Accessible tabbed content panels',
    icon: '📑',
    propSchema: {
      items: { type: 'array', label: 'Tab panels', required: true, description: 'Array of {label, content, icon?}' },
      variant: { type: 'enum', label: 'Style', options: ['underline', 'pills', 'bordered', 'filled'], default: 'underline' },
      defaultTab: { type: 'number', label: 'Default active tab index', default: 0 },
    },
    defaultProps: { items: [{ label: 'Tab 1', content: 'Content here.' }, { label: 'Tab 2', content: 'More content.' }], variant: 'underline', defaultTab: 0 },
    allowedRegions: ['main'],
    wcagRequirements: ['Tab list must use role="tablist"', 'Tabs must manage aria-selected and aria-controls', 'Panels use role="tabpanel"'],
    version: 1,
  },

  // ─── CONTENT BLOCKS ─────────────────────────────────────────────────────

  FAQ_BLOCK: {
    type: 'FAQ_BLOCK',
    name: 'FAQ Block',
    category: 'interactive',
    description: 'Frequently asked questions with structured FAQ schema markup',
    icon: '❓',
    propSchema: {
      heading: { type: 'string', label: 'Section heading', default: 'Frequently Asked Questions' },
      items: { type: 'array', label: 'FAQ items', required: true, description: 'Array of {question, answer}' },
      schemaMarkup: { type: 'boolean', label: 'Include FAQ structured data (JSON-LD)', default: true },
    },
    defaultProps: { heading: 'Frequently Asked Questions', items: [{ question: 'Question?', answer: 'Answer.' }], schemaMarkup: true },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  TESTIMONIAL: {
    type: 'TESTIMONIAL',
    name: 'Testimonial',
    category: 'content',
    description: 'Testimonial card or grid with photo, name, role, and quote',
    icon: '💬',
    propSchema: {
      items: { type: 'array', label: 'Testimonials', required: true, description: 'Array of {name, role, organization, quote, avatarUrl, rating?}' },
      layout: { type: 'enum', label: 'Layout', options: ['single', 'grid', 'carousel'], default: 'grid' },
      heading: { type: 'string', label: 'Section heading' },
    },
    defaultProps: { items: [{ name: 'Name', role: 'Role', quote: 'Testimonial text.' }], layout: 'grid' },
    allowedRegions: ['main'],
    version: 1,
  },

  TEAM_MEMBER: {
    type: 'TEAM_MEMBER',
    name: 'Team Member',
    category: 'content',
    description: 'Team member card with photo, bio, and social links',
    icon: '👤',
    propSchema: {
      name: { type: 'string', label: 'Full name', required: true },
      role: { type: 'string', label: 'Position / role', required: true },
      bio: { type: 'richtext', label: 'Biography' },
      avatarUrl: { type: 'url', label: 'Profile photo URL', wcagNote: 'Alt text auto-set to name' },
      email: { type: 'string', label: 'Email' },
      linkedin: { type: 'url', label: 'LinkedIn URL' },
      orcid: { type: 'url', label: 'ORCID URL' },
      scholar: { type: 'url', label: 'Google Scholar URL' },
    },
    defaultProps: { name: 'Name', role: 'Role' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  EVENT_BLOCK: {
    type: 'EVENT_BLOCK',
    name: 'Event Block',
    category: 'content',
    description: 'Upcoming event or announcement with date, location, and registration link',
    icon: '📅',
    propSchema: {
      title: { type: 'string', label: 'Event title', required: true },
      dateAd: { type: 'string', label: 'Date (AD/Gregorian)', required: true },
      dateBs: { type: 'string', label: 'Date (BS/Nepali calendar)' },
      time: { type: 'string', label: 'Time (with timezone)' },
      location: { type: 'string', label: 'Location / Venue' },
      onlineUrl: { type: 'url', label: 'Online event link' },
      description: { type: 'richtext', label: 'Description' },
      registrationUrl: { type: 'url', label: 'Registration URL' },
      coverImageUrl: { type: 'url', label: 'Cover image' },
    },
    defaultProps: { title: 'Event Title', dateAd: '' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  NEWSLETTER: {
    type: 'NEWSLETTER',
    name: 'Newsletter Subscription',
    category: 'interactive',
    description: 'Email newsletter signup form with backend integration',
    icon: '📧',
    propSchema: {
      heading: { type: 'string', label: 'Heading', default: 'Subscribe to Newsletter' },
      description: { type: 'string', label: 'Description text' },
      placeholder: { type: 'string', label: 'Input placeholder', default: 'your@email.com' },
      buttonText: { type: 'string', label: 'Submit button text', default: 'Subscribe' },
      privacyText: { type: 'string', label: 'Privacy note text', default: 'No spam. Unsubscribe anytime.' },
      apiEndpoint: { type: 'url', label: 'Custom API endpoint', description: 'Defaults to /api/v1/notifications/subscribe' },
    },
    defaultProps: { heading: 'Subscribe to Newsletter', placeholder: 'your@email.com', buttonText: 'Subscribe', privacyText: 'No spam. Unsubscribe anytime.' },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Input must have an accessible label', 'Error messages must be announced via aria-live'],
    version: 1,
  },

  SOCIAL_LINKS: {
    type: 'SOCIAL_LINKS',
    name: 'Social Links',
    category: 'interactive',
    description: 'Social media and academic profile links grid',
    icon: '🔗',
    propSchema: {
      links: { type: 'array', label: 'Social links', required: true, description: 'Array of {platform, url, handle?}' },
      layout: { type: 'enum', label: 'Layout', options: ['icons', 'buttons', 'list'], default: 'icons' },
    },
    defaultProps: { links: [], layout: 'icons' },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['Each link must have aria-label describing the platform'],
    version: 1,
  },

  BREADCRUMB: {
    type: 'BREADCRUMB',
    name: 'Breadcrumb',
    category: 'navigation',
    description: 'Semantic breadcrumb navigation trail',
    icon: '🍞',
    propSchema: {
      items: { type: 'array', label: 'Breadcrumb items', description: 'Array of {label, url} — auto-generated if empty' },
      separator: { type: 'string', label: 'Separator character', default: '/' },
    },
    defaultProps: { separator: '/', items: [] },
    allowedRegions: ['main', 'header'],
    wcagRequirements: ['Must use <nav aria-label="Breadcrumb">', 'Current page must have aria-current="page"'],
    version: 1,
  },

  TABLE_OF_CONTENTS: {
    type: 'TABLE_OF_CONTENTS',
    name: 'Table of Contents',
    category: 'navigation',
    description: 'Auto-generated in-page table of contents from headings',
    icon: '📋',
    propSchema: {
      heading: { type: 'string', label: 'Section heading', default: 'Table of Contents' },
      maxDepth: { type: 'enum', label: 'Maximum depth', options: ['1', '2', '3', '4'], default: '3' },
      numbered: { type: 'boolean', label: 'Numbered entries', default: false },
      sticky: { type: 'boolean', label: 'Sticky sidebar ToC', default: false },
    },
    defaultProps: { heading: 'Table of Contents', maxDepth: '3', numbered: false, sticky: false },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  RELATED_CONTENT: {
    type: 'RELATED_CONTENT',
    name: 'Related Content',
    category: 'navigation',
    description: 'Backend-fetched related articles, publications, or research',
    icon: '🔄',
    propSchema: {
      heading: { type: 'string', label: 'Section heading', default: 'Related Content' },
      contentType: { type: 'enum', label: 'Content type', options: ['posts', 'publications', 'research', 'poems', 'mixed'], default: 'mixed' },
      count: { type: 'number', label: 'Number of items', default: 3, min: 1, max: 12 },
      manual: { type: 'array', label: 'Manual items', description: 'Override with specific IDs: [{id, type}]' },
    },
    defaultProps: { heading: 'Related Content', contentType: 'mixed', count: 3 },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  // ─── EMBEDS ──────────────────────────────────────────────────────────────

  EMBED: {
    type: 'EMBED',
    name: 'Embed',
    category: 'embed',
    description: 'YouTube, Vimeo, Twitter/X, Maps, GitHub Gist, CodePen, or generic iframe',
    icon: '▶',
    editorjsTool: 'Embed',
    propSchema: {
      url: { type: 'url', label: 'Embed URL', required: true },
      provider: { type: 'enum', label: 'Provider', options: ['youtube', 'vimeo', 'twitter', 'facebook', 'instagram', 'linkedin', 'bluesky', 'mastodon', 'maps', 'github-gist', 'codepen', 'iframe'], default: 'youtube' },
      caption: { type: 'string', label: 'Caption' },
      title: { type: 'string', label: 'Iframe title', wcagRequired: true, wcagNote: 'Iframe must have a descriptive title for accessibility' },
      aspectRatio: { type: 'enum', label: 'Aspect ratio', options: ['16/9', '4/3', '1/1', '9/16'], default: '16/9' },
      lazyLoad: { type: 'boolean', label: 'Lazy load', default: true },
    },
    defaultProps: { provider: 'youtube', aspectRatio: '16/9', lazyLoad: true },
    allowedRegions: ['main'],
    wcagRequirements: ['iframe must have a title attribute', 'Embedded content must not auto-play with sound'],
    version: 1,
  },

  // ─── HERO & SHOWCASE ────────────────────────────────────────────────────

  HERO: {
    type: 'HERO',
    name: 'Hero Section',
    category: 'layout',
    description: 'Full-width hero section with title, subtitle, CTAs, and optional background',
    icon: '🦸',
    propSchema: {
      tagline: { type: 'string', label: 'Tagline / eyebrow text' },
      title: { type: 'string', label: 'Main heading', required: true },
      subtitle: { type: 'richtext', label: 'Subtitle / description' },
      primaryCta: { type: 'object', label: 'Primary CTA', description: '{label, url}' },
      secondaryCta: { type: 'object', label: 'Secondary CTA', description: '{label, url}' },
      backgroundType: { type: 'enum', label: 'Background', options: ['gradient', 'image', 'video', 'color', 'none'], default: 'gradient' },
      backgroundValue: { type: 'string', label: 'Background value', description: 'Image URL, color code, or gradient string' },
      avatarUrl: { type: 'url', label: 'Profile image URL', wcagNote: 'Alt text auto-set from title' },
      alignment: { type: 'enum', label: 'Content alignment', options: ['left', 'center', 'right'], default: 'left' },
      minHeight: { type: 'enum', label: 'Min height', options: ['auto', 'sm', 'md', 'lg', 'full-viewport'], default: 'md' },
    },
    defaultProps: { title: 'Welcome', backgroundType: 'gradient', alignment: 'left', minHeight: 'md' },
    allowedRegions: ['main', 'header'],
    version: 1,
  },

  STATS: {
    type: 'STATS',
    name: 'Statistics Grid',
    category: 'layout',
    description: 'Impact metrics and key statistics display',
    icon: '📈',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      stats: { type: 'array', label: 'Statistics', required: true, description: 'Array of {value, label, icon?, description?}' },
      columns: { type: 'enum', label: 'Columns', options: ['2', '3', '4'], default: '4' },
      variant: { type: 'enum', label: 'Style', options: ['cards', 'minimal', 'bordered', 'gradient'], default: 'cards' },
      animateCountUp: { type: 'boolean', label: 'Animate count-up on scroll', default: true },
    },
    defaultProps: { stats: [{ value: '0+', label: 'Metric', icon: '📊' }], columns: '4', variant: 'cards', animateCountUp: true },
    allowedRegions: ['main'],
    version: 1,
  },

  TIMELINE: {
    type: 'TIMELINE',
    name: 'Timeline',
    category: 'layout',
    description: 'Chronological timeline with events, dates, and descriptions',
    icon: '⏳',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      items: { type: 'array', label: 'Timeline events', required: true, description: 'Array of {dateAd, dateBs, title, description, icon?, imageUrl?}' },
      direction: { type: 'enum', label: 'Direction', options: ['vertical', 'horizontal'], default: 'vertical' },
      variant: { type: 'enum', label: 'Style', options: ['default', 'alternating', 'minimal'], default: 'default' },
    },
    defaultProps: { items: [{ dateAd: '2026', title: 'Event', description: 'Description.' }], direction: 'vertical', variant: 'default' },
    allowedRegions: ['main'],
    version: 1,
  },

  CARD_GRID: {
    type: 'CARD_GRID',
    name: 'Card Grid',
    category: 'layout',
    description: 'Responsive grid of content cards',
    icon: '🗂',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      description: { type: 'string', label: 'Description' },
      items: { type: 'array', label: 'Cards', required: true },
      columns: { type: 'enum', label: 'Columns', options: ['1', '2', '3', '4'], default: '2' },
    },
    defaultProps: { items: [], columns: '2' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  PUBLICATION_LIST: {
    type: 'PUBLICATION_LIST',
    name: 'Publication List',
    category: 'academic',
    description: 'Academic publications with citation formats',
    icon: '📚',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      items: { type: 'array', label: 'Publications', required: true },
      citationStyle: { type: 'enum', label: 'Citation style', options: ['APA', 'MLA', 'Chicago', 'OSCOLA', 'BibTeX'], default: 'APA' },
      showDoi: { type: 'boolean', label: 'Show DOI links', default: true },
      showPdf: { type: 'boolean', label: 'Show PDF links', default: true },
    },
    defaultProps: { items: [], citationStyle: 'APA', showDoi: true, showPdf: true },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  RESEARCH_LIST: {
    type: 'RESEARCH_LIST',
    name: 'Research Projects',
    category: 'academic',
    description: 'Research project list with status, timeline, and description',
    icon: '🔬',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      items: { type: 'array', label: 'Research projects', required: true },
    },
    defaultProps: { items: [] },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  ARTICLE_LIST: {
    type: 'ARTICLE_LIST',
    name: 'Article List',
    category: 'academic',
    description: 'Blog post / article listing with metadata',
    icon: '📰',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      description: { type: 'string', label: 'Description' },
      items: { type: 'array', label: 'Articles', description: 'Provide items or use contentQuery to fetch from backend' },
      contentQuery: { type: 'object', label: 'Auto-fetch query', description: '{type, limit, status, tag, category}' },
    },
    defaultProps: { items: [] },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  AUTHOR_CARD: {
    type: 'AUTHOR_CARD',
    name: 'Author Card',
    category: 'academic',
    description: 'Academic author profile with bio and academic links',
    icon: '🎓',
    propSchema: {
      name: { type: 'string', label: 'Name', required: true },
      title: { type: 'string', label: 'Academic title / role' },
      bio: { type: 'richtext', label: 'Biography' },
      avatarUrl: { type: 'url', label: 'Profile photo URL', wcagNote: 'Alt text auto-set to author name' },
      orcid: { type: 'url', label: 'ORCID URL' },
      scholar: { type: 'url', label: 'Google Scholar URL' },
      linkedin: { type: 'url', label: 'LinkedIn URL' },
      website: { type: 'url', label: 'Personal website URL' },
      expertise: { type: 'array', label: 'Areas of expertise' },
    },
    defaultProps: { name: 'Author Name' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  TEXT_BLOCK: {
    type: 'TEXT_BLOCK',
    name: 'Text Section',
    category: 'text',
    description: 'Simple text section with heading and body content',
    icon: '📄',
    propSchema: {
      heading: { type: 'string', label: 'Section heading' },
      subheading: { type: 'string', label: 'Subheading' },
      content: { type: 'richtext', label: 'Body content', required: true },
      callout: { type: 'string', label: 'Callout / highlight text' },
    },
    defaultProps: { content: 'Content here.' },
    allowedRegions: ['main', 'sidebar'],
    version: 1,
  },

  CONTACT_FORM: {
    type: 'CONTACT_FORM',
    name: 'Contact Form',
    category: 'interactive',
    description: 'Contact or inquiry form with backend API integration',
    icon: '📬',
    propSchema: {
      heading: { type: 'string', label: 'Form heading', default: 'Contact' },
      description: { type: 'string', label: 'Form description' },
      isNewsletter: { type: 'boolean', label: 'Newsletter mode (email only)', default: false },
      apiEndpoint: { type: 'url', label: 'Backend endpoint', default: 'http://localhost:4000/api/v1/notifications/send' },
      fields: { type: 'array', label: 'Custom form fields', description: 'Array of {name, label, type, required}' },
    },
    defaultProps: { heading: 'Contact', isNewsletter: false },
    allowedRegions: ['main', 'sidebar'],
    wcagRequirements: ['All inputs must have associated visible labels', 'Error messages must be announced', 'Form must have a descriptive submit button'],
    version: 1,
  },

  RAW_HTML: {
    type: 'RAW_HTML',
    name: 'Raw HTML',
    category: 'layout',
    description: 'Raw HTML block — admin only, restricted by permission',
    icon: '</>',
    propSchema: {
      html: { type: 'html', label: 'Raw HTML content', required: true },
      sandboxed: { type: 'boolean', label: 'Render in sandboxed iframe', default: false },
    },
    defaultProps: { html: '<!-- Raw HTML -->', sandboxed: false },
    allowedRegions: ['main'],
    version: 1,
  },
};

export const BLOCK_CATEGORIES = {
  text: { label: 'Text & Formatting', icon: '✏️' },
  media: { label: 'Media', icon: '📷' },
  layout: { label: 'Layout & Structure', icon: '⚡' },
  interactive: { label: 'Interactive', icon: '🖱' },
  academic: { label: 'Academic & Research', icon: '🎓' },
  embed: { label: 'Embeds', icon: '▶' },
  navigation: { label: 'Navigation', icon: '🧭' },
};

export function getBlockDefinition(type: string): IBlockDefinitionSchema | undefined {
  return BLOCK_SCHEMA_REGISTRY[type];
}

export function getBlocksByCategory(category: string): IBlockDefinitionSchema[] {
  return Object.values(BLOCK_SCHEMA_REGISTRY).filter((b) => b.category === category);
}

export function getAllBlockTypes(): IBlockDefinitionSchema[] {
  return Object.values(BLOCK_SCHEMA_REGISTRY);
}
