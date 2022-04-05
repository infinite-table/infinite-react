import React from 'react';
import Head from 'next/head';
import App from './devexpress.app';

class Page extends React.Component {
  render() {
    return (
      <>
        <Head>
          <title>DevExtreme Demo</title>
          <meta
            http-equiv="X-UA-Compatible"
            content="IE=edge"
          />
          <meta
            http-equiv="Content-Type"
            content="text/html; charset=utf-8"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
          />
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
