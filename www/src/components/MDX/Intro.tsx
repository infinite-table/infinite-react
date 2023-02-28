import * as React from 'react';

export interface IntroProps {
  children?: React.ReactNode;
}

function Intro({ children }: IntroProps) {
  return <div className="text-xl leading-relaxed">{children}</div>;
}

Intro.displayName = 'Intro';

export default Intro;
