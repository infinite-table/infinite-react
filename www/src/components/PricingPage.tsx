import { Card, Cards, CardsSubtitle, CardsTitle } from '@www/components/Cards';

import { MainContent, MainLayout } from '@www/layouts/MainLayout';
import { wwwVars } from '@www/styles/www-utils.css';

import * as React from 'react';
import { AccentButton } from './AccentButton';
import {
  GradientTextBackground,
  HighlightBrandToLightBackground,
  SpotlightHorizontalBackgroundCls,
  SpotlightRadialBackgroundCls,
} from './components.css';
import { getHeroHeaderTextStyling, HeroHeader } from './Header';
import { OverlineCls } from './Header.css';
import { HeroImage, HeroPicture } from './HeroPicture';
import { getHighlightShadowStyle, HighlightButton } from './HighlightButton';

const BASE_PRICE = Number(process.env.NEXT_PUBLIC_LICENSE_PRICE || '395');
const LICENSE_MAX = 19;
const discounts = [
  {
    count: 3,
    value: 5,
  },
  { count: 5, value: 10 },
  { count: 10, value: 15 },
];

const HAS_PADDLE = !!process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
let initPaddleScript = HAS_PADDLE;

type PaddleType = {
  Environment: { set: (arg: any) => void };
  Checkout: { open: (arg: any) => void };
  Setup: (arg: any) => any;
};
declare var Paddle: PaddleType;

function toFixed(v: number | string) {
  return Number(Number(v).toFixed(2));
}

function formatCurrency(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function PriceSummary({ count }: { count: number }) {
  const price = getPrice(count);
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
            {formatCurrency(Math.floor(toFixed(price / count)))} per developer /
            year
          </p>
        </>
      )}
    </div>
  );
}

function getPrice(count: number): number {
  const firstDiscount = discounts[0];

  if (count < firstDiscount.count) {
    return BASE_PRICE * count;
  }
  const len = discounts.length;

  for (let i = len - 1; i >= 0; i--) {
    const { value: discountValue, count: discountThreshold } = discounts[i];

    if (count >= discountThreshold) {
      return toFixed(count * BASE_PRICE * (1 - discountValue / 100));
    }
  }

  return BASE_PRICE * count;
}

function DiscountsTable(props: { discounts: [string, string, string][] }) {
  return (
    <>
      <table>
        <thead className="border-b border-special-border-color">
          <tr>
            <th className="pl-10 w-full"># Licenses</th>
            <th>$</th>
            <th className="text-right pl-5 pr-3">Discount</th>
          </tr>
        </thead>
        <tbody>
          {props.discounts.map((discount, i) => {
            const [label, price, percentage] = discount;
            return (
              <tr key={i}>
                <td className={`pt-3 pl-10`}>{label}</td>
                <td className={`pt-3  whitespace-nowrap`}>{price}</td>
                <td className={`pt-3 pr-3 whitespace-nowrap text-right`}>
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
  let [value, setValue] = React.useState(1);

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
        Team size
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
          className="flex-1 text-xl text-dark-custom font-black text-center"
          style={{ minWidth: 20 }}
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
  React.useEffect(() => {
    if (!initPaddleScript) {
      return;
    }
    initPaddleScript = false;
    const paddleScript = document.createElement('script');
    paddleScript.onload = () => {
      Paddle.Environment.set('sandbox');
      Paddle.Setup({
        vendor: Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID),
      });
    };

    document.body.appendChild(paddleScript);
    paddleScript.src = 'https://cdn.paddle.com/paddle/paddle.js';
  }, []);

  function onBuyClick() {
    Paddle.Checkout.open({ product: 36608 });
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

  const [count, setCount] = React.useState(1);

  return (
    <MainLayout
      title={
        <>
          <span className={``}>One Pricing</span> — Infinite Applications
        </>
      }
      subtitle={
        <>
          <p>
            Easy to understand licensing —{' '}
            <span className={GradientTextBackground}>development licenses</span>{' '}
            only
          </p>
          <p>No deployment or application license needed.</p>
        </>
      }
    >
      <MainContent
        dottedBg={false}
        overline={false}
        style={{ justifyContent: 'flex-start' }}
      >
        <div className="checkout-container"></div>
        <div className="w-full flex flex-row items-stretch mt-20 mx-auto justify-center">
          <div className="relative z-20 my-20 ">
            <Card
              title="Buy once, use everywhere"
              className="border-b pr-20 border-special-border-color"
            >
              Your license is valid for all the apps your company is developing
            </Card>

            <Card
              title="No deployment license"
              className="border-b pr-20 border-special-border-color"
            >
              There's no deployment license for your apps. It's that simple!
            </Card>

            <Card title="Per developer pricing" className="pr-20">
              Use the calculator on the right to see the price for your whole
              team. Buy one license seat for each developer working on your app
              in a given year.
            </Card>
          </div>
          <Card
            title=""
            style={{}}
            noBackground
            className={`shadow-lg bg-deep-dark bg-opacity-95 relative -left-10  z-20 w-1/2 rounded-lg text-content-color`}
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
                title="Volume discounts"
                className=""
              >
                <DiscountsTable
                  discounts={[
                    ['Single developer', '$ 395', ' - '],
                    ['3+ developers', '$ 375', '5%'],
                    ['5+ developers', '$ 355', '10%'],
                    ['10+ developers', '$ 395', '15%'],
                  ]}
                />

                <div
                  className={`justify-center items-center flex flex-col font-black pt-10 mt-10 ${OverlineCls} relative`}
                >
                  <TeamSize onCountChange={setCount} />

                  <PriceSummary count={count} />
                </div>
                {HAS_PADDLE ? (
                  <AccentButton
                    disabled={count >= 20}
                    className="mt-10"
                    onClick={onBuyClick}
                  >
                    Buy
                  </AccentButton>
                ) : null}
              </Card>
            </div>
          </Card>
        </div>
        <MainContent className="mt-40">
          <Cards title="How it works">
            <Card title="Getting the License Key">
              Once you buy a license for your team, you'll receive the license
              key via email. Note it will be only one license key for your whole
              team (the license key will contain the developer count you
              provide). The license key includes information like the license
              owner, the license start and end dates and also the developer
              count.
            </Card>
            <Card title="App deployment">
              Deploy your app with the license key you have been provided. The
              license key will be valid for all the apps your team is
              developing.
            </Card>
            <Card title="Access to versions">
              Each version of Infinite Table has a release timetamp. When you
              purchase a license, it gives you unlimited access to all Infinite
              Table versions published within a 1 year window from the date of
              purchase. If you don't renew your license, you will still be able
              to use the versions published within this timeframe without any
              warnings.
            </Card>
            <Card title="Free with license footer">
              If you don't have a license key, you can still use Infinite Table,
              but it shows a license footer with a link back to our website.
              Buying a license removes the footer and gives you access to
              premium support.
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
