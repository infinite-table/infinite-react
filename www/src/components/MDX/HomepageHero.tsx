import HeroCards from './HeroCards';

function HomepageHero() {
  return (
    <>
      <HeroCards
        cards={[
          {
            title: 'Learn how to use Infinite Table',
            description: 'Unleash the power of Infinite Table',
            link: '/docs/learn/getting-started',
          },
          {
            title: 'API Reference',
            description: 'Look up the component props',
            link: '/docs/reference',
          },
        ]}
      />
    </>
  );
}

export default HomepageHero;
