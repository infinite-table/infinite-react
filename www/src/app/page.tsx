// import Image from 'next/image';
// import { Inter } from 'next/font/google';
import { IndexPage } from '@www/components/IndexPage';
import { asMeta } from '@www/utils/asMeta';

const seoTitle =
  'Infinite Table DataGrid for React — One Table — Infinite Applications.';
const seoDescription = `Infinite Table DataGrid for React — One Table — Infinite Applications. Infinite Table is the modern DataGrid for building React apps — faster.`;

export const metadata = asMeta({
  title: seoTitle,
  description: seoDescription,
});

// or Dynamic metadata
// export async function generateMetadata({ params }) {
//   return {
//     title: '...',
//   };
// }

export default function Home() {
  return <IndexPage />;
}
