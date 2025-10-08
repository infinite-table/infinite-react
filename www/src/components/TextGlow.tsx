import { CSSProperties, ReactNode } from "react";
import { GradientText } from "./GradientText";

type TextGlowProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function TextGlow(props: TextGlowProps) {
  return (
    <GradientText bold={false} className={props.className} style={props.style}>
      {props.children}
    </GradientText>
  );
}
