import Link from 'next/link';
import LinkList from '@examples/LinkList';
export default () => {
  return (
    <LinkList>
      <Link href="/icss/background">ICSS</Link>
      <Link href="/components/table">Table demos</Link>
      <Link href="/components/rowlist">Row list</Link>
      <Link href="/tests/table">Table test pages</Link>
    </LinkList>
  );
};
