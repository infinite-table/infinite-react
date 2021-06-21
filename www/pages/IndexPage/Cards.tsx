import * as React from "react";
import { ReactNode } from "react";
import {
  colorWhite,
  backgroundColorBlue700,
  borderRadius,
  fontSize,
  display,
  centeredFlexProps,
  flexWrap,
  maxWidth,
  marginY,
  shadow,
} from "../../styles/theme.css";
import { card, grid } from "./index.css";
const Card = ({
  href,
  title,
  children,
}: {
  href: string;
  title: ReactNode;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      className={`${card}
      ${colorWhite} ${backgroundColorBlue700} ${shadow.md} ${borderRadius.default}`}
    >
      <h3>{title} &rarr;</h3>
      <p className={fontSize.lg}>{children}</p>
    </a>
  );
};
export const Cards = () => {
  return (
    <div
      className={`${display.flex} ${grid} ${centeredFlexProps} ${flexWrap.wrap} ${maxWidth["5xl"]} ${marginY[16]} `}
      style={{
        gridGap: "1.5rem",
      }}
    >
      <Card title="📃 Documentation" href="https://nextjs.org/docs">
        Find in-depth information about <b>REACT INFINITE TABLE</b>.
      </Card>

      <Card title="🔎 Examples" href="https://nextjs.org/learn">
        Discover practical examples to help you get started
      </Card>

      <Card
        title="📢 Blog"
        href="https://github.com/vercel/next.js/tree/master/examples"
      >
        Read our articles to help you get the most of the infinite table
      </Card>

      <Card
        title="🧪 Automated tests"
        href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      >
        Thoroughly tested with real browsers and e2e tests
      </Card>
    </div>
  );
};
