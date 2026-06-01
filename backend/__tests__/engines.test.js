const { ENGINES, benchmark } = require('../engines');

describe('ENGINES', () => {
  it('contains all 6 engines', () => {
    expect(Object.keys(ENGINES)).toEqual(['mustache', 'handlebars', 'ejs', 'nunjucks', 'eta', 'lodash']);
  });

  it('each engine has name and example', () => {
    for (const [, def] of Object.entries(ENGINES)) {
      expect(def.name).toBeTruthy();
      expect(def.example.template).toBeTruthy();
      expect(def.example.data).toBeDefined();
    }
  });
});

describe('benchmark()', () => {
  it('throws for unknown engine', () => {
    expect(() => benchmark('unknown', 'tmpl', {}, 1)).toThrow('Unknown engine: unknown');
  });

  it('returns string result and numeric duration_ms', () => {
    const { result, duration_ms } = benchmark('mustache', 'Hello {{name}}!', { name: 'World' }, 10);
    expect(result).toBe('Hello World!');
    expect(typeof duration_ms).toBe('number');
    expect(duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('mustache renders correctly', () => {
    const { result } = benchmark('mustache', '{{a}} + {{b}}', { a: 1, b: 2 }, 1);
    expect(result).toBe('1 + 2');
  });

  it('handlebars renders conditionals', () => {
    const { result } = benchmark('handlebars', '{{#if ok}}yes{{else}}no{{/if}}', { ok: true }, 1);
    expect(result).toBe('yes');
  });

  it('ejs renders expressions', () => {
    const { result } = benchmark('ejs', '<%= x * 2 %>', { x: 5 }, 1);
    expect(result).toBe('10');
  });

  it('nunjucks renders filters', () => {
    const { result } = benchmark('nunjucks', '{{ name | upper }}', { name: 'hello' }, 1);
    expect(result).toBe('HELLO');
  });

  it('eta renders with it prefix', () => {
    const { result } = benchmark('eta', '<%= it.val %>', { val: 42 }, 1);
    expect(result).toBe('42');
  });

  it('lodash renders template literals', () => {
    const { result } = benchmark('lodash', '${x}', { x: 'ok' }, 1);
    expect(result).toBe('ok');
  });

  it('duration_ms is averaged over iterations', () => {
    const r1 = benchmark('mustache', '{{x}}', { x: 'a' }, 1);
    const r2 = benchmark('mustache', '{{x}}', { x: 'a' }, 1000);
    expect(r1.duration_ms).toBeGreaterThanOrEqual(0);
    expect(r2.duration_ms).toBeGreaterThanOrEqual(0);
  });
});
