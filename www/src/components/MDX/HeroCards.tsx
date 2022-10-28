import YouWillLearnCard from '@www/components/MDX/YouWillLearnCard';
import * as React from 'react';

type HeroCard = {
  title: string;
  description: string;
  link: string;
};
type HeroCardsProps = {
  cards?: [HeroCard, HeroCard];
  children?: React.ReactNode;
};
function HeroCards(props: HeroCardsProps) {
  const children = props.children
    ? React.Children.toArray(props.children)
    : [
        <YouWillLearnCard
          title={props.cards![0].title}
          path={props.cards![0].link}
        >
          <p>{props.cards![0].description}</p>
        </YouWillLearnCard>,
        <YouWillLearnCard
          title={props.cards![1].title}
          path={props.cards![1].link}
        >
          <p>{props.cards![1].description}</p>
        </YouWillLearnCard>,
      ];
  return (
    <section className="my-8 sm:my-10 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      <div className="flex flex-col justify-center">{children[0]}</div>
      <div className="flex flex-col justify-center">{children[1]}</div>
    </section>
  );
}
export default HeroCards;
