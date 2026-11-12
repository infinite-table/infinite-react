import HeroCards from './HeroCards';

function HomepageHero(props: {
  /** Maps the docs links to the page's framework. */
  linkFor?: (href: string) => string;
}) {
  const linkFor = props.linkFor ?? ((href: string) => href);
  return (
    <>
      <HeroCards
        cards={[
          {
            title: 'Learn how to use Infinite Table',
            description: 'Unleash the power of Infinite Table',
            link: linkFor('/docs/learn/getting-started'),
          },
          {
            title: 'API Reference',
            description: 'Look up the component props',
            link: linkFor('/docs/reference'),
          },
        ]}
      />
    </>
  );
}

export default HomepageHero;
