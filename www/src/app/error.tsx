'use client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Server Error',
};

export default function ServerError() {
  return (
    <>
      <h1>500 - Server Error</h1>
      <p>Something went wrong on the server...</p>
    </>
  );
}
