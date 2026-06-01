const request = require('supertest');

// Mock pg before requiring app
jest.mock('../db', () => {
  const measurements = [];
  let idSeq = 1;

  return {
    initDb: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockImplementation((text, params = []) => {
      const sql = text.replace(/\s+/g, ' ').trim().toUpperCase();

      if (sql.startsWith('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }

      if (sql.startsWith('INSERT INTO MEASUREMENTS')) {
        const [engine, template, data, result, duration_ms] = params;
        const row = { id: idSeq++, engine, template, data, result, duration_ms, created_at: new Date().toISOString() };
        measurements.push(row);
        return Promise.resolve({ rows: [row] });
      }

      if (sql.startsWith('DELETE FROM MEASUREMENTS')) {
        measurements.length = 0;
        idSeq = 1;
        return Promise.resolve({ rows: [] });
      }

      if (sql.includes('GROUP BY ENGINE')) {
        const byEngine = {};
        measurements.forEach(m => {
          if (!byEngine[m.engine]) byEngine[m.engine] = [];
          byEngine[m.engine].push(m.duration_ms);
        });
        const rows = Object.entries(byEngine).map(([engine, times]) => ({
          engine,
          count: times.length,
          avg_ms: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(3),
          min_ms: Math.min(...times).toFixed(3),
          max_ms: Math.max(...times).toFixed(3),
        }));
        return Promise.resolve({ rows });
      }

      if (sql.includes('WHERE ENGINE=')) {
        const engine = params[0];
        const limit = params[1] || 50;
        return Promise.resolve({ rows: measurements.filter(m => m.engine === engine).slice(0, limit) });
      }

      if (sql.startsWith('SELECT * FROM MEASUREMENTS')) {
        const limit = params[0] || 50;
        return Promise.resolve({ rows: [...measurements].reverse().slice(0, limit) });
      }

      return Promise.resolve({ rows: [] });
    }),
  };
});

const app = require('../app');

beforeEach(() => {
  require('../db').query.mockClear();
});

describe('GET /api/engines', () => {
  it('returns array of 6 engines', async () => {
    const res = await request(app).get('/api/engines');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('example');
  });
});

describe('POST /api/render', () => {
  it('renders mustache template and returns timing', async () => {
    const res = await request(app).post('/api/render').send({
      engine: 'mustache',
      template: 'Hello {{name}}!',
      data: { name: 'World' },
      iterations: 10,
    });
    expect(res.status).toBe(200);
    expect(res.body.result).toBe('Hello World!');
    expect(res.body.duration_ms).toBeGreaterThanOrEqual(0);
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/render').send({ engine: 'mustache' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for unknown engine', async () => {
    const res = await request(app).post('/api/render').send({
      engine: 'unknown',
      template: '{{x}}',
      data: { x: 1 },
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unknown/i);
  });

  it('returns 400 for invalid JSON data string', async () => {
    const res = await request(app).post('/api/render').send({
      engine: 'mustache',
      template: '{{x}}',
      data: 'not-json',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/json/i);
  });

  it('accepts data as object (not string)', async () => {
    const res = await request(app).post('/api/render').send({
      engine: 'ejs',
      template: '<%= val %>',
      data: { val: 'test' },
    });
    expect(res.status).toBe(200);
    expect(res.body.result).toBe('test');
  });
});

describe('GET /api/measurements', () => {
  it('returns array', async () => {
    const res = await request(app).get('/api/measurements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/stats', () => {
  it('returns stats with avg/min/max', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('avg_ms');
      expect(res.body[0]).toHaveProperty('min_ms');
      expect(res.body[0]).toHaveProperty('max_ms');
      expect(res.body[0]).toHaveProperty('count');
    }
  });
});

describe('DELETE /api/measurements', () => {
  it('returns ok: true', async () => {
    const del = await request(app).delete('/api/measurements');
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);
  });
});
