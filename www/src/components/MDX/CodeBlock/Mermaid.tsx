import React, { useEffect } from 'react';
import mermaid from 'mermaid';

export interface MermaidProps {
  text: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ text }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [svg, setSvg] = React.useState<string>('');

  useEffect(() => {
    mermaid.mermaidAPI.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      theme: 'dark',
      // themeVariables: {

      // }
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
      // ref.current!.innerHTML = result;
      //   console.log('result');
      //   console.log(result);
      // });
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
