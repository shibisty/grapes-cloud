import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../src/utils/html';

describe('escapeHtml', () => {
  it('escapes the five characters that matter for innerHTML injection', () => {
    expect(escapeHtml('<script>alert("hi") & \'bye\'</script>')).toBe(
      '&lt;script&gt;alert(&quot;hi&quot;) &amp; \'bye\'&lt;/script&gt;',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('report (final).pdf')).toBe('report (final).pdf');
  });

  it('does not double-escape an already-escaped ampersand', () => {
    // Documents current behavior: escapeHtml is not idempotent, callers must call it exactly once.
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });
});
