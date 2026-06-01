const Mustache = require('mustache');
const Handlebars = require('handlebars');
const ejs = require('ejs');
const nunjucks = require('nunjucks');
const { Eta } = require('eta');
const _ = require('lodash');

const eta = new Eta();

const ENGINES = {
  mustache: {
    name: 'Mustache',
    render: (template, data) => Mustache.render(template, data),
    example: {
      template: 'Привет, {{name}}! Ты учишься на курсе "{{course}}".',
      data: { name: 'Андрей', course: 'Веб-технологии' },
    },
  },
  handlebars: {
    name: 'Handlebars',
    render: (template, data) => {
      const compiled = Handlebars.compile(template);
      return compiled(data);
    },
    example: {
      template: 'Привет, {{name}}! {{#if active}}Активный пользователь.{{/if}}',
      data: { name: 'Андрей', active: true },
    },
  },
  ejs: {
    name: 'EJS',
    render: (template, data) => ejs.render(template, data),
    example: {
      template: 'Привет, <%= name %>! Список: <% items.forEach(i => { %><%= i %> <% }); %>',
      data: { name: 'Андрей', items: ['HTML', 'CSS', 'JS'] },
    },
  },
  nunjucks: {
    name: 'Nunjucks',
    render: (template, data) => nunjucks.renderString(template, data),
    example: {
      template: 'Привет, {{ name }}! {% for item in items %}{{ item }} {% endfor %}',
      data: { name: 'Андрей', items: ['HTML', 'CSS', 'JS'] },
    },
  },
  eta: {
    name: 'Eta',
    render: (template, data) => eta.renderString(template, data),
    example: {
      template: 'Привет, <%= it.name %>! Курс: <%= it.course %>.',
      data: { name: 'Андрей', course: 'Веб-технологии' },
    },
  },
  lodash: {
    name: 'Lodash (_.template)',
    render: (template, data) => {
      const compiled = _.template(template);
      return compiled(data);
    },
    example: {
      template: 'Привет, ${name}! Оценка: ${grade}.',
      data: { name: 'Андрей', grade: 5 },
    },
  },
};

function benchmark(engine, template, data, iterations = 100) {
  const engineDef = ENGINES[engine];
  if (!engineDef) throw new Error(`Unknown engine: ${engine}`);

  let result;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    result = engineDef.render(template, data);
  }
  const end = performance.now();

  return {
    result,
    duration_ms: parseFloat(((end - start) / iterations).toFixed(3)),
  };
}

module.exports = { ENGINES, benchmark };
