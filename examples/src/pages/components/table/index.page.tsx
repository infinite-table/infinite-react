import * as React from 'react';
import Link from 'next/link';

export default () => {
  return (
    <React.StrictMode>
      <Link href="./orders">orders</Link>
      <br />
      <Link href="./perf">perf</Link>
    </React.StrictMode>
  );
};
