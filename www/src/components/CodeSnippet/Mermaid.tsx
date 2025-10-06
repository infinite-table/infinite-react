'use client';
import * as React from 'react';
import { useEffect } from 'react';
import type { SandpackInputFile } from '../Sandpack/SandpackTypes';

import mermaid from 'mermaid';

export function Mermaid(props: {
  title?: string;
  description?: React.ReactNode;
  files: SandpackInputFile[];
}) {
  const chartCode = props.files[0].code;

  return chartCode ? (
    <div className="w-full">
      <MermaidChart text={chartCode} />
    </div>
  ) : null;
}

export interface MermaidProps {
  text: string;
}
export const MermaidChart: React.FC<MermaidProps> = ({ text }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [svg, setSvg] = React.useState<string>('');

  useEffect(() => {
    mermaid.mermaidAPI.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      theme: 'dark',
      logLevel: 5,
    });
  }, []);

  useEffect(() => {
    if (ref.current && text !== '') {
      //@ts-ignore
      console.log('text is', text);
      mermaid.render('mmd-preview', text).then(({ svg }) => {
        setSvg(svg);
      });
    }
  }, [text]);

  return (
    <div
      key="preview"
      ref={ref}
      dangerouslySetInnerHTML={{
        __html: svg,
      }}
    />
  );
};
