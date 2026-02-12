// src/components/TaeExample.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarkdownIt from 'markdown-it';
import { katex } from '@mdit/plugin-katex';          // ← named import, not default
import 'katex/dist/katex.min.css';

const md = new MarkdownIt({
  html: true,
  linkify: true,
})
  .use(katex, {
    throwOnError: false,   // any KaTeX option you like
    errorColor: '#cc0000',
  });

export const TaeExample: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    fetch(`/markdown/${id}.md`)
      .then((r) => r.text())
      .then((mdTxt) => setHtml(md.render(mdTxt)));
  }, [id]);

  return (
    <div
      className="markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
