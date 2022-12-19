import * as React from 'react';
import { CardsSubtitle, CardsTitle } from './Cards';

const { default: form } = require('./GetAccessFormConvertKit.form.txt');

export function GetAccessFormConvertKit() {
  return (
    <>
      <a href="#stay-in-the-loop">
        <CardsTitle id="stay-in-the-loop" className="mt-20">
          Stay in the loop
        </CardsTitle>
      </a>
      <CardsSubtitle className="mt-5 mb-12 w-2/3 sm:w-1/2">
        <p>Keep up-to-date with our releases and new functionalities.</p>
        {/* <p>We won't share your email with 3rd parties - you have our word!</p> */}
      </CardsSubtitle>
      <div
        className="w-2/3 sm:w-1/2"
        dangerouslySetInnerHTML={{
          __html: form,
        }}
      ></div>
    </>
  );
}
