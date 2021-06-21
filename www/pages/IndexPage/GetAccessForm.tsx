import * as React from "react";
import {
  margin,
  display,
  flexDirection,
  justifyContent,
  padding,
  borderRadius,
  colorBrandDark,
  marginTop,
  marginBottom,
  colorWhite,
  shadow,
  backgroundColorBrandDark,
  paddingX,
} from "../../styles/theme.css";
import { width100, email, submitButton } from "./index.css";

export const GetAccessForm = () => {
  return (
    <form
      className={`${margin[6]} ${width100} ${display.flex} ${flexDirection.column}`}
    >
      <div
        className={`text-gray-400 focus-within:text-gray-600 ${display.flex} ${flexDirection.row} ${justifyContent.center}`}
      >
        <input
          placeholder="john@email.com"
          style={{ width: "60%" }}
          type="email"
          required
          className={`focus:ring-2  focus:ring-gray-300 ${padding[3]} ${borderRadius.md} ${colorBrandDark} ${email}`}
        />
      </div>

      <button
        className={`${submitButton} ${marginTop[6]} ${marginBottom[12]} ${colorWhite} ${shadow.md} ${backgroundColorBrandDark} ${paddingX[8]} ${padding[3]} ${borderRadius.md} `}
      >
        Get Access
      </button>
    </form>
  );
};
