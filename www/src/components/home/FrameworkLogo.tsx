import * as React from 'react';

/** The logos of the frameworks, for the "Also for" keys under the hero. */
export function FrameworkLogo({ framework }: { framework: string }) {
  if (framework === 'vue') {
    // Two logos, home.css shows one: in dark mode, Vue's own white-on-dark
    // logo (github.com/vuejs/art/blob/master/white-on-dark-logo.svg).
    return (
      <>
        <svg
          className="home-framework__logo home-framework__logo--vue-light"
          viewBox="0 0 261.76 226.69"
          aria-hidden="true"
        >
          <path
            d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
            fill="#41b883"
          />
          <path
            d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"
            fill="#34495e"
          />
        </svg>
        <svg
          className="home-framework__logo home-framework__logo--vue-dark"
          viewBox="0 0 197 170"
          fill="#fff"
          aria-hidden="true"
        >
          <polygon points="98.16 102.01 42.1757011 5.09911711 39.23 0 0 0 2.94507611 5.10107823 98.16 170.02 196.32 0 157.06 0" />
          <polygon points="98.16 29.0371525 81.35 0 75.5 0 0 0 2.94 5.1 78.4487095 5.1 98.16 39.26 117.879366 5.1 193.38 5.1 196.325 0 120.82 0 114.973219 0" />
        </svg>
      </>
    );
  }
  if (framework === 'angular') {
    return <AngularLogo />;
  }
  if (framework === 'react') {
    return (
      <svg
        className="home-framework__logo"
        viewBox="-11.5 -10.23 23 20.46"
        aria-hidden="true"
      >
        <circle r="2.05" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }
  return null;
}

const ANGULAR_PATH =
  'm222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z';

/** The current Angular logo, the gradient one of angular.dev. */
function AngularLogo() {
  const id = React.useId();
  return (
    <svg
      className="home-framework__logo"
      viewBox="0 0 223 236"
      fill="none"
      aria-hidden="true"
    >
      <path fill={`url(#${id}b)`} d={ANGULAR_PATH} />
      <path fill={`url(#${id}c)`} d={ANGULAR_PATH} />
      <defs>
        <linearGradient
          id={`${id}b`}
          x1="49.009"
          x2="225.829"
          y1="213.75"
          y2="129.722"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e40035" />
          <stop offset=".24" stopColor="#f60a48" />
          <stop offset=".352" stopColor="#f20755" />
          <stop offset=".494" stopColor="#dc087d" />
          <stop offset=".745" stopColor="#9717e7" />
          <stop offset="1" stopColor="#6c00f5" />
        </linearGradient>
        <linearGradient
          id={`${id}c`}
          x1="41.025"
          x2="156.741"
          y1="28.344"
          y2="160.344"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff31d9" />
          <stop offset="1" stopColor="#ff5be1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
