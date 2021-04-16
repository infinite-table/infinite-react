import * as React from 'react';
import Link from 'next/link';

export default () => {
  return (
    <React.StrictMode>
      <Link href="./table/orders">
        <a>orders</a>
      </Link>
      <Link href="./table/perf">
        <a>perf</a>
      </Link>
    </React.StrictMode>
  );
};
