import { Accessor, Component, createComputed, createSignal } from 'solid-js';
import { DEBUG_NAME } from '@infinite/components/InfiniteTable/InfiniteDebugName';
import { InfiniteBodyCls } from '@infinite/components/InfiniteTable/components/InfiniteTableBody/body.css';

export function createHello(): [Accessor<string>, (to: string) => void] {
  const [hello, setHello] = createSignal('Hello World!');

  return [hello, (to: string) => setHello(`Hello ${to}!`)];
}

export const Hello: Component<{ to?: string }> = (props) => {
  const [hello, setHello] = createHello();

  createComputed(() => {
    if (typeof props.to === 'string') setHello(props.to);
  });

  return (
    <>
      <div class={`${DEBUG_NAME} ${InfiniteBodyCls}`}>
        {hello()}!!!! this is !!!!!!${DEBUG_NAME}!!
      </div>
    </>
  );
};
