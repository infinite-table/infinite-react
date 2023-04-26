'use client';
import { getSandpackCssText } from '@codesandbox/sandpack-react';

export function SandpackCSSText() {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
      id="sandpack"
    />
  );
}
