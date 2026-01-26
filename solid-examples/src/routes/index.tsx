import { Title } from '@solidjs/meta';
import Counter from '~/components/Counter';
import { Hello } from '@src';
import { Test } from '@src/test';
import { createSignal } from 'solid-js';

function CustomCounter(props: { name: string }) {
  return <div>hello {props.name}</div>;
}

export default function Home() {
  const [name, setName] = createSignal('John');
  return (
    <main>
      <input
        type="text"
        value={'xxx'}
        onBeforeInput={(e) => {
          console.log('onBeforeInput', e.target.value);
          e.preventDefault();
        }}
        onInput={(e) => setName(e.target.value)}
      />
      <CustomCounter name={name()} />
      <Hello />
      <Test />
      <Title>Hello World!!!</Title>
      <h1>Hello world!!!!!!!!!</h1>
      <Counter />
      <p>
        Visit{' '}
        <a href="https://start.solidjs.com" target="_blank">
          start.solidjs.com
        </a>{' '}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
