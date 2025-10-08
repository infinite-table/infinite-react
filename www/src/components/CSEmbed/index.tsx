import * as React from 'react';
import { IconCodeBlock } from '../icons/IconCodeBlock';

const isSandpackDescriptionElement = (el: React.ReactElement) => {
  //@ts-ignore
  return el.type?.name === 'Description';
};

type SizeOption = 'default' | 'md' | 'lg';
export function CSEmbed({
  src,
  id,
  children,
  title,
  code,
  size,
}: ({ src: string; id?: string } | { src?: string; id: string }) & {
  children?: React.ReactNode;
  title?: React.ReactNode;
  size?: SizeOption;
  code?: false | number;
}) {
  src =
    src ||
    `https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&module=%2FApp.tsx&theme=dark&editorsize=${
      code === false ? 0 : typeof code === 'number' ? code : 50
    }`;

  const theChildren = React.Children.toArray(
    //@ts-ignore
    children,
  ) as React.ReactElement[];

  const description = theChildren.find(isSandpackDescriptionElement);

  const descriptionBlock = description ? (
    <div className={'leading-base w-full bg-black/20 border-gray-60'}>
      <div className="sandpackDescription text-content-color text-base px-4 py-0.5 relative">
        {description}
      </div>
    </div>
  ) : null;

  const height = size === 'default' || !size ? 500 : size === 'md' ? 650 : 850;
  const frame = (
    <iframe
      src={src}
      style={{
        width: '100%',
        height,
        border: 0,
        borderRadius: 4,
        overflow: 'hidden',
      }}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  );

  const titleBlock = title ? (
    <div className={'leading-base w-full '}>
      <div className="text-content-color flex text-base px-4 py-0.5 relative">
        <IconCodeBlock className="inline-flex mr-2 self-center" /> {title}
      </div>
    </div>
  ) : null;

  return descriptionBlock || titleBlock ? (
    <div className="bg-csdark rounded-lg">
      {titleBlock}
      {descriptionBlock}
      {frame}
    </div>
  ) : (
    frame
  );
}
