import '@components/InfiniteTable/index.scss';
import '../index.scss';

function MyApp({ Component, pageProps }) {
  if (!process.browser) {
    return null;
  }
  return (
    <React.StrictMode>
      <div className="__next">
        <Component {...pageProps} />
      </div>
    </React.StrictMode>
  );
}

export default MyApp;
