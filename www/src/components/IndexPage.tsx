import { Card, Cards } from '@www/components/Cards';
import { GetAccessForm } from '@www/components/GetAccessForm';

import * as React from 'react';
import { HighlightTextBackground } from './components.css';

import IndexWrapper from './IndexWrapper';

export function IndexPage() {
  return (
    <IndexWrapper>
      <Cards
        subtitle="Fully declarative and fully typed DataGrid built with purpose for React"
        spotlight={false}
      />

      <Cards
        title={<div className={``}>Ready for building enterprise apps</div>}
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
          Single column and multiple column sorting, with both local and remote
          sorting capabilities.
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
          Group data by specified fields, either locally or remotely. Allows you
          to easily define custom aggregations.
        </Card>

        <Card
          noBackground
          title="🧩 Column Grouping"
          href="/docs/latest/learn/column-groups"
        >
          Define groups of columns to organise data in a more meaningful way.
        </Card>

        <Card noBackground title="🎨 Theming" href="/docs/latest/learn/theming">
          Powerful theming via CSS variables - implemented from the ground up,
          not as an afterthought.
        </Card>
      </Cards>

      <Cards title="Enterprise and Community Editions">
        <Card title="Enterprise Edition">
          <p>
            You get dedicated commercial support and all the enterprise features
            mentioned above.
          </p>
          <div className="mt-10">
            Everything you'd expect from a modern DataGrid is built-in so you
            can start using it right-away in your application.
          </div>
        </Card>

        <Card title="Community Edition">
          <p>
            Contains all the functionality in the{' '}
            <b className="font-black">Enterprise version</b>, but shows a{' '}
            <b>license footer</b> with a{' '}
            <b className={HighlightTextBackground}>Powered by Infinite Table</b>{' '}
            link.
          </p>

          <div className="mt-10">
            You can use this version <b>for free in any app</b>, as long as the
            license footer is visible and contains the link back to our website.
          </div>
        </Card>
      </Cards>

      <GetAccessForm />
    </IndexWrapper>
  );
}
