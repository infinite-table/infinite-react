import { Card, Cards, CardsSubtitle } from '@www/components/Cards';
import { GetAccessForm } from '@www/components/GetAccessForm';
import { MainContent, MainLayout } from '@www/layouts/MainLayout';
import Link from 'next/link';

import * as React from 'react';
import { AccentButton } from './AccentButton';
import {
  HighlightBrandToLightBackground,
  HighlightTextBackground,
} from './components.css';
import { HeroPicture } from './HeroPicture';
import { getHighlightShadowStyle, HighlightButton } from './HighlightButton';

import { SecondaryButton } from './SecondaryButton';

function NpmCmd() {
  const [copyTimestamp, setCopyTimestamp] = React.useState(0);
  const timeoutIdRef = React.useRef<number | null>(null);

  function onClick() {
    setCopyTimestamp(Date.now());
    navigator.clipboard.writeText('npm i @infinite-table/infinite-react');
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setCopyTimestamp(0);
    }, 2000) as any as number;
  }

  return (
    <div
      className={`relative inline-flex flex-row cursor-pointer items-center px-4 py-1 rounded-md`}
      style={{ ...getHighlightShadowStyle() }}
    >
      <div
        className={`font-mono whitespace-nowrap ${HighlightBrandToLightBackground}`}
      >
        npm i @infinite-table/infinite-react
      </div>
      <div
        className={`p-2 ml-2 top-0 active:top-1 user-select-none`}
        title="Copy to clipboard"
        onClick={onClick}
      >
        📋
      </div>

      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -45,
          right: 5,
          opacity: copyTimestamp > 0 ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        Copied to clipboard!
      </div>
    </div>
  );
}
export function IndexPage() {
  return (
    <MainLayout>
      <HeroPicture />
      <div className="flex flex-col md:flex-row items-stretch">
        <AccentButton href="/pricing">Buy a license</AccentButton>{' '}
        <div className="mx-6 my-2 flex items-center justify-center">or</div>{' '}
        <NpmCmd />
      </div>
      <div className="w-1/2 mt-10 opacity-50 text-base">
        You can start using Infinite Table right away for free - the free
        version displays a license footer with a link back to our website.
        Buying a license removes the footer and gives you access to premium
        support.
      </div>
      <div
        className={['mt-20 relative w-full flex flex-col items-center '].join(
          ' ',
        )}
      >
        <CardsSubtitle
          className="w-1/2 text-xl mb-10"
          style={{ textAlign: 'left' }}
        >
          <div className="mb-10 mt-10 justify-center lg:justify-end md:float-right block md:inline-block text-center">
            {/* <AccentButton href="/docs">
              Start Building <>&rarr;</>
            </AccentButton> */}
            <SecondaryButton className="mx-5">Read the docs</SecondaryButton>
          </div>
          <p>A DataGrid component is only as good as its documentation.</p>
          <p>
            All our examples are interactive and they cover all the existing
            functionalities.
          </p>
        </CardsSubtitle>
      </div>

      <MainContent>
        <Cards
          subtitle="Fully declarative and fully typed DataGrid built with purpose for React"
          spotlight={false}
        >
          <Card title="Fully declarative" href="/docs/latest/reference">
            Infinite Table is built with React in mind so it's fully declarative
            - everything can be controlled via the available{' '}
            <span className={HighlightTextBackground}>props</span>
          </Card>{' '}
          <Card title="Fully typed">
            Written in TypeScript, it helps keep your codebase clean and avoid
            bugs while keeping you productive.
          </Card>
          <Card title="Well tested and trusted">
            Our automated integration tests run against real browsers and ensure
            our releases can be trusted. This helps us keep the quality high and
            the bugs low.
          </Card>
          <Card
            title="Themable and customizable"
            href="/docs/latest/learn/theming"
          >
            Infinite Table is built with customization in mind. You can
            customize everything from the look and feel to the behavior. Theming
            uses CSS variables so you can have a custom theme in under 10 lines
            of CSS.
          </Card>{' '}
          <Card title="Fully controlled">
            Integrates seamlessly in any React application. All the props have
            both controlled and uncontrolled versions, so you get to choose
            whatever fits your use-case.
          </Card>
          <Card
            title="Extensive documentation"
            href="/docs/latest/learn/getting-started"
          >
            All the available props are documented and all the examples are
            interactive. In addition, we have dedicated documentation pages for
            each major functionality to help you get started.
          </Card>
          <Card title="Feature-rich">
            Infinite Table comes packed with enterprise-grade features, such as
            grouping, aggregations, pivoting, filtering, lazy loading, sorting a
            lot more...
          </Card>{' '}
          <Card title="Fully virtualized">
            <p>
              Virtualization is used extensively, for both rows and columns, to
              achieve maximum performance and handle huge data-sets with ease.
            </p>
            {/* <p>
              Showing 10 columns vs 100 columns or 10 rows vs 100k rows should
              make no difference.
            </p> */}
          </Card>
        </Cards>

        <Cards
          title={
            <div className={``}>You're ready for building enterprise apps?</div>
          }
          style={{
            //@ts-ignore
            '--spotlight-left': '-10%',
          }}
        >
          <Card
            noBackground
            title="🔃 Sorting"
            href="/docs/latest/learn/working-with-data/sorting"
          >
            Single column and multiple column sorting, with both local and
            remote sorting capabilities.
          </Card>

          <Card
            noBackground
            title="💪 Row Grouping"
            href="/docs/latest/learn/grouping-and-pivoting/grouping-rows"
          >
            Group rows by a single column or by multiple columns with ease.
            Integrates with lazy data-sources so it can handle even complex
            scenarios.
          </Card>

          <Card
            noBackground
            title="🏢 Pivoting"
            href="/docs/latest/learn/grouping-and-pivoting/pivoting/overview"
          >
            Pivoting is a must-have for powerful data-visualizations. We make it
            easy to configure complex pivots.
          </Card>
          <Card
            noBackground
            title="🧪 Aggregations"
            href="/docs/latest/learn/grouping-and-pivoting/grouping-rows#aggregations"
          >
            Group data by specified fields, either locally or remotely. Allows
            you to easily define custom aggregations.
          </Card>

          <Card
            noBackground
            title="🧩 Column Grouping"
            href="/docs/latest/learn/column-groups"
          >
            Define groups of columns to organise data in a more meaningful way.
          </Card>

          <Card
            noBackground
            title="🎨 Theming"
            href="/docs/latest/learn/theming"
          >
            Powerful theming via CSS variables - implemented from the ground up,
            not as an afterthought.
          </Card>
        </Cards>

        <Cards title="Enterprise and Community Editions">
          <Card title="Enterprise Edition" flexContent>
            <p>
              When you buy a license, you get{' '}
              <span className="text-glow">dedicated commercial support</span>{' '}
              and all the enterprise features mentioned above.
            </p>
            <div className="mt-10">
              Everything you'd expect from a modern DataGrid is built-in so you
              can start using it right-away in your application.
            </div>

            <div className="flex-1"> </div>
            <div className="mt-10 text-right">
              <AccentButton href="/pricing">Start Now</AccentButton>
            </div>
          </Card>

          <Card title="Community Edition">
            <p>
              Contains all the functionality in the{' '}
              <b className="font-black">Enterprise version</b>, but displays a{' '}
              <b>license footer</b> with a{' '}
              <b className={HighlightTextBackground}>
                "Powered by Infinite Table"
              </b>{' '}
              link.
            </p>

            <div className="mt-10">
              You can use this version <b>for free in any app</b>, as long as
              the license footer is visible and contains the link back to our
              website.
            </div>

            <div className="mt-10 text-right" />
            <NpmCmd />
          </Card>
        </Cards>

        <GetAccessForm />
      </MainContent>
    </MainLayout>
  );
}
