import { MDXProvider } from "@mdx-js/react";

import "../styles/globals.css";
import { light } from "../styles/main.css";

import { appClassName } from "./_app.css";

function MyApp({ Component, pageProps }) {
  console.log(pageProps, "!");

  return (
    <MDXProvider>
      <div className={`${appClassName} ${light}`}>
        <Component {...pageProps} />
      </div>
    </MDXProvider>
  );
}

export default MyApp;
