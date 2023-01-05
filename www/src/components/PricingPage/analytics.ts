export enum AnalyticsEvents {
  checkoutComplete,
  checkoutError,
  checkoutEmailProvided,
  checkoutLoaded,
  clickBuy,
}
//define type of global fathom object
declare global {
  interface Window {
    fathom: {
      trackGoal: (code: string, value: number) => void;
    };
  }
}

export function analytics(code: AnalyticsEvents, value?: number = 0) {
  if (!window.fathom) {
    return;
  }
  if (code === AnalyticsEvents.checkoutComplete) {
    window.fathom.trackGoal('ZYTAKKBK', value);
  }
  if (code === AnalyticsEvents.clickBuy) {
    window.fathom?.trackGoal('WTUQ6HYN', value);
  }
  if (code === AnalyticsEvents.checkoutEmailProvided) {
    window.fathom.trackGoal('WWHQMOUM', value);
  }
  if (code === AnalyticsEvents.checkoutError) {
    window.fathom.trackGoal('YYE25UDN', value);
  }
  if (code === AnalyticsEvents.checkoutLoaded) {
    window.fathom.trackGoal('8VWE4HRR', value);
  }
}
