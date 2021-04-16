import Link from 'next/link';
import LinkList from '@examples/LinkList';
export default () => (
  <LinkList>
    <Link href="/tests/table/props/sortable/sortable">Sortable</Link>
    <Link href="/tests/table/props/sortInfo/controlled">
      SortInfo controlled
    </Link>
    <Link href="/tests/table/props/sortInfo/uncontrolled">
      SortInfo uncontrolled
    </Link>

    <Link href="/tests/table/props/column/flex">Column flex</Link>
  </LinkList>
);
