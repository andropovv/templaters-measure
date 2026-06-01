interface Props {
  template: string;
  dataJson: string;
  onTemplateChange: (v: string) => void;
  onDataChange: (v: string) => void;
}

export function TemplateEditor({ template, dataJson, onTemplateChange, onDataChange }: Props) {
  return (
    <div className="editor-row">
      <section className="panel flex-1">
        <label className="field-label">Шаблон</label>
        <textarea
          className="editor"
          value={template}
          onChange={(e) => onTemplateChange(e.target.value)}
          rows={6}
          spellCheck={false}
          data-testid="template-input"
        />
      </section>
      <section className="panel flex-1">
        <label className="field-label">Данные (JSON)</label>
        <textarea
          className="editor"
          value={dataJson}
          onChange={(e) => onDataChange(e.target.value)}
          rows={6}
          spellCheck={false}
          data-testid="data-input"
        />
      </section>
    </div>
  );
}
