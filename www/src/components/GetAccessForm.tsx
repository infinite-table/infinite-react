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
  fontSize,
  marginY,
  textAlign,
} from "@www/styles/utils.css";

import { width100, email, submitButton } from "./components.css";

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

export const GetAccessForm = () => {
  const [email, setEmail] = React.useState("");

  const [thankyou, setThankyou] = React.useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "contact",
        email,
      }),
    })
      .then(() => {
        setEmail("");
        setThankyou("Thank you for your interest! We'll get in touch soon.");
      })
      .catch((error) => {});
  };

  return (
    <form
      name="contact"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      className={`${margin[6]} ${width100} ${display.flex} ${flexDirection.column}`}
      onSubmit={handleSubmit}
    >
      <div
        className={` ${display.flex} ${flexDirection.row} ${justifyContent.center}`}
      >
        <input
          placeholder="john@email.com"
          style={{ width: "60%" }}
          value={email}
          type="email"
          name="email"
          required
          onChange={(e) => {
            setThankyou("");
            setEmail(e.target.value);
          }}
          className={` ${padding[3]} ${borderRadius.md} ${colorBrandDark} ${email}`}
        />
        <input hidden name="form-name" value={"contact"} />
      </div>

      <div
        className={`${display.flex} ${flexDirection.row} ${justifyContent.center} ${colorWhite} ${marginY[6]} ${fontSize["xl"]} ${textAlign.center}`}
      >
        {thankyou}
      </div>
      <button
        type="submit"
        className={`${submitButton} ${marginTop[6]} ${marginBottom[12]} ${colorWhite} ${shadow.md} ${backgroundColorBrandDark} ${paddingX[8]} ${padding[3]} ${borderRadius.md} `}
      >
        Get Access
      </button>
    </form>
  );
};
