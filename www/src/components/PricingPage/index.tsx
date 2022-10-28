import { Card, Cards, CardsSubtitle, CardsTitle } from '@www/components/Cards';

import { MainContent, MainLayout } from '@www/layouts/MainLayout';
import { wwwVars } from '@www/styles/www-utils.css';

import * as React from 'react';
import { AccentButton } from '../AccentButton';
import {
  GradientTextBackground,
  HighlightBrandToLightBackground,
} from '../components.css';
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

const HAS_PADDLE = !!process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID;
let initPaddleScript = HAS_PADDLE;

type PaddleType = {
  Environment: { set: (arg: any) => void };
  Checkout: { open: (arg: any) => void };
  Setup: (arg: any) => any;
};
declare const Paddle: PaddleType;

function PriceSummary({ count }: { count: number }) {
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
      seoTitle={
        'Infinite Table DataGrid for React — One License — Infinite Applications.'
      }
      seoDescription="One License - Infinite Applications. Infinite Table is the modern DataGrid for building React apps with a straightforward licensing model."
      title={
        <>
          <span className={``}>One License</span> — Infinite Applications
        </>
      }
      subtitle={
        <>
          <p>
            Easy to understand pricing —{' '}
            <span className={HighlightBrandToLightBackground}>
              development licenses only.
            </span>
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
        <div className="w-full flex flex-col sm:flex-row items-stretch mt-20 mx-auto justify-center">
          <div className="relative z-20 my-20 ">
            <Card
              title="Buy once, use everywhere"
              className="border-b sm:pr-20 md:pr-20 border-special-border-color rounded-xl rounded-b-none"
            >
              Your license is valid for all the apps your company is developing
            </Card>

            <Card
              title="No hidden costs"
              className="border-b sm:pr-20 md:pr-20 border-special-border-color rounded-none"
            >
              A single license is all that's required. There's no deployment or
              distribution license for your apps. It's that simple!
            </Card>

            <Card
              title="Per developer pricing"
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
                    [
                      'Single developer',
                      getFormattedPricePerDeveloper(1),
                      ' - ',
                    ],
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

                <div className="text-center">
                  <AccentButton
                    disabled={count >= 20 || !HAS_PADDLE}
                    className="mt-10"
                    onClick={onBuyClick}
                  >
                    <>Buy Infinite Table for React</>
                    {!HAS_PADDLE ? <> - COMING SOON</> : null}
                  </AccentButton>
                </div>
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
            <Card title="Application deployment">
              Deploy your application with the license key you have been
              provided. The license key will be valid for{' '}
              <span className={'text-glow'}>all the apps</span> your team is
              developing.
            </Card>
            <Card title="Access to versions">
              Each version of Infinite Table has a release timestamp. When you
              purchase a license, it gives you unlimited access to all Infinite
              Table versions published within a 1 year window from the date of
              purchase. If you don't renew your license, you will still be able
              to use the versions published within this timeframe without any
              warnings.
            </Card>
            <Card title="Free with license footer">
              If you don't have a license key, you can still use Infinite Table,
              but it displays a license footer with a link back to our website.
              Buying a license removes the footer and gives you access to
              premium support.
            </Card>
            <Card title="Premium Support">
              If you have a license key, you can access premium support, either{' '}
              <a href="mailto:admin@infinite-table.com" className=" text-glow ">
                by email
              </a>{' '}
              or by raising a Zendesk ticket.
            </Card>
            <Card title="Supporting the developer community">
              Infinite Table has been built on open-source software and we are
              keen to give back by providing free licenses to qualifying
              open-source projects. Please{' '}
              <a href="mailto:admin@infinite-table.com" className=" text-glow ">
                contact us
              </a>{' '}
              for details.
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
