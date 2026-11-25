// Types for the Angular examples app (tsconfig.angular.json has `types: []`)

// the test pages spy with sinon (no type package installed)
declare module 'sinon';

// the test pages read process.env.NEXT_PUBLIC_* like the React ones: set by
// env.generated.ts (scripts/generate-angular-app.js)
declare var process: {
  env: {
    NEXT_PUBLIC_BASE_URL?: string;
    NEXT_PUBLIC_INFINITE_LICENSE_KEY?: string;
    NEXT_PUBLIC_EXAMPLES_PORT?: string;
    NEXT_PUBLIC_EXAMPLES_VUE_PORT?: string;
    NEXT_PUBLIC_EXAMPLES_ANGULAR_PORT?: string;
    NEXT_PUBLIC_TEST_RUNNER_PORT?: string;
    [key: `NEXT_PUBLIC_${string}`]: string | undefined;
  };
};
