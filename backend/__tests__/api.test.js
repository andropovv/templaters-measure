const request = require('supertest');

// Use in-memory DB for tests
process.env.TEST_DB = ':memory:';

const app = require('../app');

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

  it('returns 400 for invalid JSON data', async () => {
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

  it('includes saved measurements after render', async () => {
    await request(app).post('/api/render').send({
      engine: 'nunjucks',
      template: '{{ msg }}',
      data: { msg: 'hi' },
      iterations: 5,
    });
    const res = await request(app).get('/api/measurements');
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('engine');
    expect(res.body[0]).toHaveProperty('duration_ms');
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
  it('clears all measurements', async () => {
    await request(app).post('/api/render').send({
      engine: 'mustache',
      template: '{{x}}',
      data: { x: 1 },
    });
    const del = await request(app).delete('/api/measurements');
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);

    const list = await request(app).get('/api/measurements');
    expect(list.body).toHaveLength(0);
  });
});
