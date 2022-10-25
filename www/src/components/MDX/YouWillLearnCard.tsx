import ButtonLink from '@www/components/ButtonLink';
import { IconNavArrow } from '@www/components/Icon/IconNavArrow';
import * as React from 'react';

interface YouWillLearnCardProps {
  title: string;
  path: string;
  inline?: boolean;
  newTab?: boolean;
  children: React.ReactNode;
}

function YouWillLearnCard({
  title,
  path,
  children,
  inline,
  newTab,
}: YouWillLearnCardProps) {
  return (
    <div
      className={`${
        inline ? 'inline-flex' : 'flex'
      } flex-col h-full bg-dark-custom shadow-inner justify-between rounded-lg pb-8 p-6 xl:p-8`}
    >
      <div>
        <h4 className="font-bold text-2xl leading-tight">{title}</h4>
        <div className="my-4">{children}</div>
      </div>
      <div>
        <ButtonLink
          href={path}
          target={newTab ? '_blank' : '_self'}
          className="mt-1"
          type="primary"
          size="md"
          label={title}
        >
          Read More
          <IconNavArrow displayDirection="right" className="inline ml-1" />
        </ButtonLink>
      </div>
    </div>
  );
}

export default YouWillLearnCard;
