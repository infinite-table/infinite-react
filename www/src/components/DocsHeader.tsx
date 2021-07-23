import * as React from "react";
import {
  display,
  backgroundColorWhite,
  shadow,
  backgroundColorBrand,
  colorWhite,
  paddingY,
  paddingX,
  centeredFlexRow,
  fontSize,
  colorBrand,
  colorBrandDark,
  position,
  top,
  zIndex,
  margin,
  padding,
} from "../styles/utils.css";
import { container, width100 } from "./components.css";
import { DocsMenuItem } from "./DocsMenu";

export type DocsHeaderProps = {
  version: string;
  versionInfo: {
    date: string;
    alias: string;
  };
};
export const DocsHeader = (props: DocsHeaderProps) => {
  return (
    <>
      <div
        className={`${width100} ${shadow.lg} ${colorBrandDark}  ${backgroundColorWhite} ${position.sticky} ${top["0"]} ${zIndex[10]} `}
      >
        <div className={`${container} ${display.flex} ${margin.auto}`}>
          <div className={` ${paddingY[6]} `}>
            <img width={85} height={40} src="/logo-infinite.svg" />
          </div>
          <div className={`${centeredFlexRow} ${position.relative}`}>
            <div className={`${fontSize["2xl"]} ${paddingX["6"]} `}>
              Infinite Table Documentation
            </div>
            <div
              className={`${fontSize.xs} ${position.absolute}`}
              style={{
                whiteSpace: "nowrap",
                bottom: 8,
                right: 25,
                opacity: 0.6,
              }}
            >
              / {props.versionInfo.alias} / {props.versionInfo.date}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
