import React from 'react';
import Head from 'next/head';
import App from './devexpress.app';

class Page extends React.Component {
  render() {
    return (
      <>
        <Head>
          <title>DevExtreme Demo</title>
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdn3.devexpress.com/jslib/21.2.6/css/dx.common.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdn3.devexpress.com/jslib/21.2.6/css/dx.light.css"
          />
        </Head>

        <div className="demo-container">
          <App />
        </div>
      </>
    );
  }
}

export async function getServerSideProps() {
  return {
    props: {
      suppressGeneralStyles: true,
    }, // will be passed to the page component as props
  };
}

export default Page;
