import {
  margin,
  display,
  flexDirection,
  justifyContent,
  padding,
  borderRadius,
  marginTop,
  marginBottom,
  colorWhite,
  shadow,
  paddingX,
  fontSize,
  marginY,
  textAlign,
  wwwVars,
} from '@www/styles/www-utils.css';
import * as React from 'react';
import { CardsSubtitle, CardsTitle } from './Cards';

import { width100, email as emailCls, submitButton } from './components.css';

function encode(data: any) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export const GetAccessForm = () => {
  const [email, setEmail] = React.useState('');

  const [thankyou, setThankyou] = React.useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encode({
        'form-name': 'contact',

        email,
      }),
    })
      .then(() => {
        setEmail('');
        setThankyou("Thank you for your interest! We'll get in touch soon.");
      })
      .catch((error) => {});
  };

  return (
    <>
      <CardsTitle className="mt-20">Stay in the loop</CardsTitle>

      <CardsSubtitle className="mt-5 mb-12 w-2/3 sm:w-1/2">
        <div>
          <p>Keep up-to-date with our releases and new features</p>
          <p>We won't share your email with 3rd parties - you have our word!</p>
        </div>
      </CardsSubtitle>
      <form
        name="contact"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        style={{
          maxWidth: wwwVars.maxSiteWidth,
        }}
        className={`${margin[6]} ${width100} ${display.flex} ${flexDirection.column} `}
        onSubmit={handleSubmit}
      >
        <div
          className={` ${display.flex} ${flexDirection.row} ${justifyContent.center}`}
        >
          <input
            placeholder="john@email.com"
            style={{ width: '60%' }}
            value={email}
            type="email"
            name="email"
            required
            onChange={(e) => {
              setThankyou('');
              setEmail(e.target.value);
            }}
            className={`${emailCls} ${padding[3]} ${borderRadius.md} text-white focus:bg-gray-90 hover:bg-gray-90 border-white border bg-black `}
          />
          <input hidden name="form-name" value={'contact'} readOnly />
        </div>

        <div
          className={`${display.flex} ${flexDirection.row} ${justifyContent.center} ${colorWhite} ${marginY[6]} ${fontSize['xl']} ${textAlign.center}`}
        >
          {thankyou}
        </div>
        <button
          type="submit"
          className={`${submitButton} ${marginTop[6]} ${marginBottom[12]}  ${shadow.md} text-content-color border-content-color border bg-dark-custom ${paddingX[8]} ${padding[3]} ${borderRadius.md} `}
        >
          Let's go
        </button>
      </form>
    </>
  );
};
