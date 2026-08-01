import { compileTokensToCss } from './index';

describe('Design Tokens Engine Compiler Test', () => {
  it('should compile tokens to CSS custom properties', () => {
    const tokens = [
      { id: '1', tenantId: 't1', category: 'colors', tokenName: 'color-primary', tokenValue: '#000000', darkValue: '#ffffff' },
    ];
    const css = compileTokensToCss(tokens);
    expect(css).toContain('--color-primary: #000000;');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--color-primary: #ffffff;');
  });
});
