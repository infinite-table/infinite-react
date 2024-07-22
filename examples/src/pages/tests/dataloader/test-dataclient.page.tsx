import { DataClient } from '@infinite-table/infinite-react';

(globalThis as any).DataClient = DataClient;
export default function () {
  return <div>hello world</div>;
}
