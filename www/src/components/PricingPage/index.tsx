import { Card, Cards, CardsSubtitle, CardsTitle } from '@www/components/Cards';

import { MainContent, MainLayout } from '@www/layouts/MainLayout';
import { wwwVars } from '@www/styles/www-utils.css';
import Link from 'next/link';

import * as React from 'react';
import { AccentButton } from '../AccentButton';
import { HighlightBrandToLightBackground } from '../components.css';
import { ExternalLink } from '../ExternalLink';
import { getHeroHeaderTextStyling, HeroHeader } from '../Header';
import { OverlineCls } from '../Header.css';
import {
  BASE_PRICE,
  discounts,
  formatCurrency,
  getFormattedPricePerDeveloper,
  getPriceForCount,
  LICENSE_MAX,
} from './priceCalculator';

let HAS_PADDLE = !!process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
let initPaddleScript = HAS_PADDLE;

type PaddleType = {
  Environment: { set: (arg: any) => void };
  Checkout: { open: (arg: any) => void };
  Setup: (arg: any) => any;
};
declare const Paddle: PaddleType;

function PriceSummary({ count }: { count: number }) {
  if (HAS_PADDLE && window.location.hash !== '#paddle') {
    HAS_PADDLE = false;
  }
  const price = getPriceForCount(count);
  const priceText = formatCurrency(price);
  return (
    <div
      className={'text-xl mt-10 font-black text-center'}
      style={{
        textShadow: `10px 10px 100px ${wwwVars.color.highlight}`,
      }}
    >
      {count > LICENSE_MAX ? (
        <p className="font-normal">
          For teams of <span className="font-black">{LICENSE_MAX + 1}+</span>{' '}
          developers, email{' '}
          <a href="mailto:admin@infinite-table.com" className=" text-link ">
            admin@infinite-table.com
          </a>{' '}
          to get a personalised price.
        </p>
      ) : (
        <>
          Total: <span className="text-glow text-3xl ml-2">{priceText}</span>
          <p className="text-base font-normal">
            {getFormattedPricePerDeveloper(count)} per developer / year
          </p>
        </>
      )}
    </div>
  );
}

function DiscountsTable(props: { discounts: [string, string, string][] }) {
  return (
    <>
      <table className="text-base sm:text-lg">
        <thead className="border-b border-special-border-color">
          <tr>
            <th className="md:pl-10 w-full"># Licenses</th>
            <th>$</th>
            <th className="text-right pl-5 pr-1 md:pr-3">Discount</th>
          </tr>
        </thead>
        <tbody>
          {props.discounts.map((discount, i) => {
            const [label, price, percentage] = discount;
            return (
              <tr key={i}>
                <td className={`pt-3 md:pl-10 whitespace-nowrap`}>{label}</td>
                <td className={`pt-3  whitespace-nowrap`}>{price}</td>
                <td
                  className={`pt-3 pr-1 md:pr-3 whitespace-nowrap text-right font-bold`}
                >
                  {percentage}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function TeamSize(props: { onCountChange: (count: number) => void }) {
  const [value, setValue] = React.useState(1);

  const clamp = (v: number) => Math.max(1, Math.min(100, v));
  const boxClassName =
    ' rounded-md flex active:bg-highlight-dark cursor-pointer user-select-none flex-col pointer items-center justify-center px-5 py-2 text-2xl font-bold';

  React.useEffect(() => {
    props.onCountChange(value);
  }, [value]);
  return (
    <div className="w-2/3 text-center">
      <div
        className="mb-3 text-xl font-black"
        style={{
          textShadow: `10px 10px 50px ${wwwVars.color.highlight}`,
        }}
      >
        Team Size
      </div>
      <div
        className="flex flex-row w-full border border-special-border-color "
        style={{
          boxShadow: `1px 1px 10px 1px ${wwwVars.color.highlight}`,
        }}
      >
        <button
          onClick={() => {
            setValue((v) => clamp(v - 1));
          }}
          className={`${boxClassName}`}
        >
          -
        </button>
        <input
          type="number"
          size={3}
          value={value}
          onChange={(e) => {
            setValue(clamp(e.target.valueAsNumber));
          }}
          className="p-2 flex-1 text-xl text-dark-custom font-black text-center"
          style={{ minWidth: 20, width: 70 }}
        />
        <button
          onClick={() => {
            setValue((v) => clamp(v + 1));
          }}
          className={`${boxClassName}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
export function PricingPage() {
  const [count, setCount] = React.useState(1);

  React.useEffect(() => {
    if (!initPaddleScript) {
      return;
    }
    initPaddleScript = false;
    const paddleScript = document.createElement('script');
    paddleScript.onload = () => {
      // Paddle.Environment.set('sandbox');
      Paddle.Setup({
        vendor: Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
      });
    };

    document.body.appendChild(paddleScript);
    paddleScript.src = 'https://cdn.paddle.com/paddle/paddle.js';
  }, []);

  function onBuyClick() {
    //@ts-ignore
    window.fathom?.trackGoal('WTUQ6HYN', 0);
    console.log({ quantity: count });

    const discount =
      count >= 10
        ? discounts[2].discountValue
        : count >= 5
        ? discounts[1].discountValue
        : count >= 3
        ? discounts[0].discountValue
        : 0;
    const overrideUrl =
      count >= 10
        ? process.env.NEXT_PUBLIC_PADDLE_VOLUME_DISCOUNT_TEST_10_LINK
        : count >= 5
        ? process.env.NEXT_PUBLIC_PADDLE_VOLUME_DISCOUNT_TEST_5_LINK
        : count >= 3
        ? process.env.NEXT_PUBLIC_PADDLE_VOLUME_DISCOUNT_TEST_3_LINK
        : '';

    const openParams = {
      product: process.env.NEXT_PUBLIC_PADDLE_SUBSCRIPTION_PLAIN_ID,
      allowQuantity: false,
      quantity: count,
      title:
        count === 1
          ? `Infinite Table - 1 license`
          : discount
          ? `Infinite Table - ${count} licenses, ${discount}% off`
          : `Infinite Table - ${count} licenses`,
      message: !discount
        ? `We will email you the license key shortly after the checkout. Thank you for trusting Infinite Table!`
        : `You have ${discount}% discount when purchasing ${count} Infinite Table licenses.`,
      method: 'overlay',
    };

    if (overrideUrl) {
      //@ts-ignore
      openParams.override = overrideUrl;
    }
    Paddle.Checkout.open(openParams);
    // Paddle.Checkout.open({
    //   method: 'inline',
    //   product: 36608, // Replace with your Product or Plan ID
    //   allowQuantity: true,
    //   disableLogout: true,
    //   frameTarget: 'checkout-container', // The className of your checkout <div>
    //   frameInitialHeight: 416,
    //   frameStyle:
    //     'width:100%; min-width:312px; background-color: transparent; border: none;', // Please ensure the minimum width is kept at or above 286px with checkout padding disabled, or 312px with checkout padding enabled. See "General" section under "Branded Inline Checkout" below for more information on checkout padding.
    // });
  }

  return (
    <MainLayout
      seoTitle={
        'Infinite Table DataGrid for React — One License — Infinite Applications.'
      }
      seoDescription="One License - Infinite Applications. Infinite Table is the modern DataGrid for building React apps with a straightforward licensing model."
      title={
        <>
          <span>One License</span> — Infinite Applications
        </>
      }
      subtitle={
        <>
          <p>
            Easy to understand pricing —{' '}
            <span className={HighlightBrandToLightBackground}>
              development licenses only
            </span>
          </p>
          <p>No deployment or application licenses required</p>
        </>
      }
    >
      <MainContent
        dottedBg={false}
        overline={false}
        style={{ justifyContent: 'flex-start' }}
      >
        <div className="checkout-container"></div>
        <div className="w-full flex flex-col sm:flex-row items-stretch  mx-auto justify-center">
          <div className="relative z-20 my-20 ">
            <Card
              href="#buy-once-use-always"
              title="Buy Once, Use Always"
              className="border-b sm:pr-20 md:pr-20 border-special-border-color rounded-xl rounded-b-none"
            >
              Your license is valid for all the apps your company is developing
            </Card>

            <Card
              href="#no-hidden-costs"
              title="No Hidden Costs"
              className="border-b sm:pr-20 md:pr-20 border-special-border-color rounded-none"
            >
              One license is all that's required. There's no deployment or
              distribution license for your apps. It's that simple!
            </Card>

            <Card
              href="#per-developer-pricing"
              title="Per-developer Pricing"
              className="sm:pr-20 md:pr-20 rounded-t-none rounded-xl"
            >
              Use the calculator on the right to see the price for your whole
              team. Buy one license seat for each front-end developer working on
              your app in a given year.
            </Card>
          </div>
          <Card
            title=""
            noBackground
            style={{
              // boxShadow: `2px 2px 10px 1px ${wwwVars.color.highlight}`,
              boxShadow: ` 0 2px 6px -2px ${wwwVars.color.highlight}, 0 2px 4px -2px ${wwwVars.color.highlight}`,
            }}
            className={`shadow-lg bg-deep-dark bg-opacity-95 relative sm:-left-10  z-20 sm:w-1/2 rounded-xl text-content-color`}
          >
            <div className="text-right">
              <div
                style={getHeroHeaderTextStyling().style}
                className={getHeroHeaderTextStyling().className}
              >
                <p
                  className={'text-glow'}
                  style={{
                    textShadow: `10px 10px 100px ${wwwVars.color.highlight}`,
                  }}
                >
                  $ {BASE_PRICE}
                </p>
              </div>
              <p className={''}>per developer / year</p>
            </div>

            <div>
              <Card
                noBackground
                noBackgroundOnHover
                title="Volume Discounts"
                className=""
              >
                <DiscountsTable
                  discounts={[
                    ['1+ developer', getFormattedPricePerDeveloper(1), ' - '],
                    [
                      `${discounts[0].devCount}+ developers`,
                      `$ ${discounts[0].perDeveloperPrice}`,
                      `${discounts[0].discountValue}%`,
                    ],
                    [
                      `${discounts[1].devCount}+ developers`,
                      `$ ${discounts[1].perDeveloperPrice}`,
                      `${discounts[1].discountValue}%`,
                    ],
                    [
                      `${discounts[2].devCount}+ developers`,
                      `$ ${discounts[2].perDeveloperPrice}`,
                      `${discounts[2].discountValue}%`,
                    ],
                  ]}
                />

                <div
                  className={`justify-center items-center flex flex-col font-black pt-10 mt-10 ${OverlineCls} relative`}
                >
                  <TeamSize onCountChange={setCount} />

                  <PriceSummary count={count} />
                </div>

                <div className="text-center mt-10">
                  {!HAS_PADDLE ? null : (
                    <AccentButton
                      disabled={count >= 20 || !HAS_PADDLE}
                      className="mt-10"
                      onClick={onBuyClick}
                    >
                      <>Buy Infinite Table for React</>
                      {!HAS_PADDLE ? <> - COMING SOON</> : null}
                    </AccentButton>
                  )}
                  <span className="text-sm">
                    We are close to the official launch of Infinite Table and
                    will start accepting payments. In the meantime we are happy
                    to reward our first users with a
                  </span>
                  <br />

                  <span className=" text-xl">
                    <a
                      className="text-glow"
                      href="mailto:admin@infinite-table.com?subject=Free 3 month license"
                    >
                      free 3 month license
                    </a>
                  </span>
                </div>
              </Card>
            </div>
          </Card>
        </div>
        <MainContent className="mt-40">
          <Cards title="How It works">
            <Card
              title="Getting the License Key"
              href="#getting-the-license-key"
            >
              Once you buy a license for your team, you'll receive the license
              key via email. Note it will be only one license key for your whole
              team (the license key will contain the developer count you
              provide). The license key includes information like the license
              owner, start and end dates and the developer count.
            </Card>
            <Card title="Application Deployment" href="#application-deployment">
              Deploy your application with the license key you have been
              provided. The license key will be valid for{' '}
              <span className={'text-glow'}>all the apps</span> your team is
              developing.
            </Card>
            <Card title="Access to Versions" href="#access-to-versions">
              Each version of Infinite Table has a release timestamp. When you
              purchase a license, it gives you unlimited access to all Infinite
              Table versions published within a 1 year window from the date of
              purchase. If you don't renew your license, you will still be able
              fully to use the versions published within this timeframe without
              any warnings.
            </Card>
            <Card
              title="Free with License Footer"
              href="#free-with-license-footer"
            >
              If you don't have a license key, you can still use Infinite Table,
              but it displays a license footer with a link back to our website.
              Buying a license removes the footer and gives you access to
              premium support.
            </Card>
            <Card title="Premium Support" href="#premium-support" tag="div">
              <>
                If you have a license key, you can access premium support{' '}
                <a
                  href="mailto:admin@infinite-table.com"
                  className=" text-glow "
                >
                  by email
                </a>{' '}
                (Zendesk support is coming soon). Please see the{' '}
                <Link href="/eula#support-schedule">
                  <a className="text-glow">Support Schedule</a>
                </Link>{' '}
                for more details.
              </>
            </Card>
            <Card
              title="Supporting the Developer Community"
              href="#supporting-the-community"
              tag="div"
            >
              Infinite Table has been built on open-source software and we are
              keen to give back by providing free licenses to qualifying
              open-source projects. Please{' '}
              <a href="mailto:admin@infinite-table.com" className=" text-glow ">
                contact us
              </a>{' '}
              for more details.
            </Card>
          </Cards>

          <Cards
            title={
              <a id="faq" href="#faq">
                Frequently Asked Questions
              </a>
            }
          >
            <Card
              title="Our team has over 20 developers – what is the price?"
              href="#team-over-20"
              tag="div"
            >
              For teams of more than 20 developers we ask you to contact us at{' '}
              <a href="mailto:admin@infinite-table.com" className=" text-glow ">
                admin@infinite-table.com
              </a>{' '}
              in order to receive a personalised quotation.
            </Card>
            {/* <Card title="What happens if we do not renew?" href="#renewal">
              Your current version of Infinite Table will continue to work fully
              at the end of the licensed period. However you will not be
              eligible for updates or support.
            </Card> */}

            {/* <Card
              title="Do we receive Support with our license?"
              href="#access-to-support"
              tag="div"
            >
              Yes, an Infinite Table license includes comprehensive support.
              Please see the Support Schedule in our{' '}
              <Link href="/eula#support-schedule">
                <a className="text-glow">License</a>
              </Link>{' '}
              for more details.
            </Card> */}
            <Card
              title="Are there any additional costs?"
              href="#no-additional-costs"
            >
              No, at Infinite Table we pride ourselves that the quoted cost is
              the only one that you will be required to pay. There are no hidden
              or additional costs.
            </Card>
            <Card
              title="I am studying for my PhD and cannot afford your license – can you help me?"
              href="#special-licenses"
              tag="div"
            >
              Yes, Infinite Table offers a{' '}
              <Link href="/eula#4-special-usage-license">
                <a className="text-glow">Special Usage License</a>
              </Link>{' '}
              to be granted at our discretion. This is typically provided to:
              <ul style={{ listStyleType: 'initial' }} className="ml-10">
                <li>Students in full time education</li>
                <li>Charities and NGOs</li>
                <li>Open Source Products</li>
              </ul>{' '}
              Please get in touch if you think that you might be eligible for us
              and we will be happy to discuss further.
            </Card>
            <Card
              title="Is my personal data protected?"
              href="#supporting-the-community"
              tag="div"
            >
              Yes, Infinite Table supports full Data Protection and adheres to
              the usual legal standards e.g. GDPR. See our{' '}
              <Link href="/eula#12-data-protection">
                <a className="text-glow">License</a>
              </Link>{' '}
              for more details.
            </Card>
            {/* <Card
              title="Do I need a license to get rid of the footer?"
              href="#license-footer"
            >
              Yes, the only way to remove the footer is to be in possession of a
              valid Infinite Table license.
            </Card> */}

            <Card
              title="Who processes the Payment?"
              href="#payment processing"
              tag="div"
            >
              <p>
                We use{' '}
                <ExternalLink glow href="https://paddle.com">
                  Paddle
                </ExternalLink>{' '}
                – a leading payment provider with an excellent record and
                reputation for managing payments safely and securely. It offers
                a complete payments, tax, and subscriptions solution for SaaS.
              </p>
              <br />
              <p>
                All payments are processed by Paddle and we do not have access
                to your payment details.
              </p>
            </Card>
            {/* <Card
              title="How many updates do you guarantee in each annual license period?"
              href="#updates"
            >
              Infinite Table is continually being enhanced and improved in
              response to user feedback and suggestions. We guarantee a minimum
              of 4 quarterly releases each year, but in practice it will be many
              more.
            </Card> */}
            <Card title="Do you provide refunds?" tag="div" href="#refunds">
              <p>Yes, absolutely.</p>
              <br />
              <p>
                If you believe that you purchased your Infinite License in
                error, please contact us within 7 days of the sale, at{' '}
                <a
                  href="mailto:admin@infinite-table.com"
                  className=" text-glow "
                >
                  admin@infinite-table.com
                </a>
                , to request a refund.
              </p>
            </Card>
          </Cards>
          {/* <Cards title="" style={{ marginTop: 0 }}>
          <Card title="A licensing model that's easy to understand">
            One license per developer - it's that easy!
          </Card>
          <Card title="Flexible team bundles">
            We sell licenses in bundles, which are flexible to allow your team
            to expand.
          </Card>
        </Cards> */}
        </MainContent>
      </MainContent>
    </MainLayout>
  );
}
