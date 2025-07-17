/**

We have this utility - it's used in Menu Renderable declaration
because:

type Renderable = React.ReactNode;

const x: Renderable = <div />;
const y: Renderable = {};

we don't want to allow the above `y` as a valid declaration

it breaks some types in the Menu component as well

 */
export type RemoveObject<T> = T extends null | undefined
  ? T
  : T extends unknown
  ? keyof T extends never
    ? never
    : T
  : never;
