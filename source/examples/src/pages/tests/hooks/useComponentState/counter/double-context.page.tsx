import {
  getComponentStateRoot,
  useComponentState,
} from '@src/components/hooks/useComponentState';
import { ReactNode } from 'react';

type Cmp1State = {
  name: string;
  lastName: string;
};
const Cmp1Root = getComponentStateRoot({
  getInitialState: (props: Cmp1Props) => {
    return {
      name: props.name ?? 'one',
      lastName: 'still one',
    };
  },
});

type Cmp1Props = {
  name: 'the one';
  children: ReactNode;
};

const Cmp1Simple = () => {
  const { componentState } = useComponentState<Cmp1State>();

  return (
    <>
      <div>Name: {componentState.name}</div>
      <div>last name: {componentState.lastName}</div>
    </>
  );
};
const Cmp1 = (props: Cmp1Props) => {
  return (
    <Cmp1Root {...props}>
      <Cmp1Simple />
      {props.children}
    </Cmp1Root>
  );
};
type Cmp2State = {
  secondName: string;
  secondLastName: string;
};
const Cmp2Root = getComponentStateRoot({
  getInitialState: (props: Cmp2Props) => {
    return {
      secondName: props.secondName ?? 'second',
      secondLastName: 'still  second',
    };
  },
});

type Cmp2Props = {
  secondName?: string;
  children?: ReactNode;
};

const Cmp2Simple = () => {
  const { componentState } = useComponentState<Cmp2State>();

  return (
    <>
      <div>Second Name: {componentState.secondName}</div>
      <div>last name: {componentState.secondLastName}</div>
      <Third />
    </>
  );
};

const Third = () => {
  const { componentState } = useComponentState<Cmp2State>();

  return <div>third cmp = {componentState.secondLastName}</div>;
};
const Cmp2 = (props: Cmp2Props) => {
  return (
    <Cmp2Root {...props}>
      <Cmp2Simple />
    </Cmp2Root>
  );
};
export default function DoubleContext() {
  return (
    <Cmp1 name="the one">
      <Cmp2 />
    </Cmp1>
  );
}
