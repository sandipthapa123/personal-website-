import { IDesignToken } from '@cms/shared-types';

export type ITokenInput = IDesignToken | Omit<IDesignToken, 'id' | 'tenantId'>;

export const DEFAULT_DESIGN_TOKENS: Omit<IDesignToken, 'id' | 'tenantId'>[] = [
  { category: 'colors', tokenName: 'color-primary-500', tokenValue: '#0f172a', darkValue: '#f8fafc' },
  { category: 'colors', tokenName: 'color-primary-600', tokenValue: '#0284c7', darkValue: '#38bdf8' },
  { category: 'colors', tokenName: 'color-surface', tokenValue: '#ffffff', darkValue: '#0f172a' },
  { category: 'colors', tokenName: 'color-text', tokenValue: '#1e293b', darkValue: '#f1f5f9' },
  { category: 'radius', tokenName: 'radius-md', tokenValue: '0.5', unit: 'rem' },
  { category: 'radius', tokenName: 'radius-lg', tokenValue: '0.75', unit: 'rem' },
  { category: 'spacing', tokenName: 'space-block-padding', tokenValue: '3', unit: 'rem' },
];

/**
 * Compiles array of design tokens into root CSS custom properties
 */
export function compileTokensToCss(tokens: ITokenInput[]): string {
  let lightCss = ':root {\n';
  let darkCss = '@media (prefers-color-scheme: dark) {\n  :root {\n';

  tokens.forEach((token) => {
    const unitStr = token.unit || '';
    lightCss += `  --${token.tokenName}: ${token.tokenValue}${unitStr};\n`;
    if (token.darkValue) {
      darkCss += `    --${token.tokenName}: ${token.darkValue}${unitStr};\n`;
    }
  });

  lightCss += '}\n';
  darkCss += '  }\n}\n';

  return `${lightCss}\n${darkCss}`;
}
