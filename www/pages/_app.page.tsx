import "../styles/globals.css";

import { className } from "./_app.css";
import { light } from "../styles/theme.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${className} ${light}`}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
