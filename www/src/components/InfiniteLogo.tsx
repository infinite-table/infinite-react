import { newvars } from '@www/styles/www-utils';
import { CSSProperties, useId } from 'react';

export type InfiniteLogoColors = 'light' | 'dark' | 'gradient';
export function InfiniteLogo(
  props: {
    className?: string;

    style?: CSSProperties;
    color?: InfiniteLogoColors;
  } = {
    color: 'light',
  },
) {
  const id = useId().replace('.', '-');
  const style: CSSProperties = {
    width: 'auto',
    height: newvars.header.lineHeight,
    ...props.style,
  };

  let color = '';
  if (props.color === 'light') {
    color = newvars.color.contentColor as string;
  } else if (props.color === 'dark') {
    color = newvars.color.black as string;
  }

  if (color) {
    //@ts-ignore
    style['--infinite-logo-color-stop-1'] = color;
    //@ts-ignore
    style['--infinite-logo-color-stop-2'] = color;
  } else {
    //@ts-ignore
    style['--infinite-logo-color-stop-1'] = wwwVars.color.glow;
    //@ts-ignore
    style['--infinite-logo-color-stop-2'] = wwwVars.color.accent2;
  }

  return (
    <svg
      width="115"
      height="54"
      viewBox="0 0 115 54"
      fill="none"
      style={style}
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M77 15C77 13.9231 77.9231 13 79 13H81C82.0769 13 83 13.9231 83 15V17C83 18.0769 82.0769 19 81 19H79C77.9231 19 77 18.0769 77 17V15Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M77 26C77 24.9231 77.9231 24 79 24H81C82.0769 24 83 24.9231 83 26V28C83 29.0769 82.0769 30 81 30H79C77.9231 30 77 29.0769 77 28V26Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M77 37C77 35.9231 77.9231 35 79 35H81C82.0769 35 83 35.9231 83 37V39C83 40.0769 82.0769 41 81 41H79C77.9231 41 77 40.0769 77 39V37Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M87 15C87 13.9231 87.9231 13 89 13H91C92.0769 13 93 13.9231 93 15V17C93 18.0769 92.0769 19 91 19H89C87.9231 19 87 18.0769 87 17V15V15Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M87 26C87 24.9231 87.9231 24 89 24H91C92.0769 24 93 24.9231 93 26V28C93 29.0769 92.0769 30 91 30H89C87.9231 30 87 29.0769 87 28V26V26Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M87 37C87 35.9231 87.9231 35 89 35H91C92.0769 35 93 35.9231 93 37V39C93 40.0769 92.0769 41 91 41H89C87.9231 41 87 40.0769 87 39V37V37Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M97 15C97 13.9231 97.9231 13 99 13H101C102.077 13 103 13.9231 103 15V17C103 18.0769 102.077 19 101 19H99C97.9231 19 97 18.0769 97 17V15Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M97 26C97 24.9231 97.9231 24 99 24H101C102.077 24 103 24.9231 103 26V28C103 29.0769 102.077 30 101 30H99C97.9231 30 97 29.0769 97 28V26Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M97 37C97 35.9231 97.9231 35 99 35H101C102.077 35 103 35.9231 103 37V39C103 40.0769 102.077 41 101 41H99C97.9231 41 97 40.0769 97 39V37Z"
        fill="var(--infinite-logo-color-stop-2,#497AFF)"
      />
      <path
        d="M106.041 2.94545C102.946 0.981818 99.5255 0.327273 96.5935 0.163636C94.6388 -1.63913e-07 92.1955 0 90.2408 0C89.5892 0 88.7748 0 88.2861 0C79.8159 0 72.3229 3.92727 67.4363 9.98182L60.5949 18.4909L64.6671 23.4L72.1601 13.9091C75.9065 9.16364 81.7705 6.21818 88.2861 6.21818C89.1006 6.21818 89.915 6.21818 90.5666 6.21818C100.829 6.05455 108.81 6.05454 108.81 27C108.81 47.9455 100.829 47.9455 90.5666 47.7818C89.7521 47.7818 88.9377 47.7818 88.2861 47.7818C81.7705 47.7818 76.0694 44.8364 72.1601 40.0909L62.0609 27.4909L60.2691 25.3636L57.6629 22.0909L47.8895 9.98182C42.8399 3.92727 35.347 0 26.8768 0C26.2252 0 25.5737 0 24.9221 0C22.8045 0 20.5241 -1.63913e-07 18.4065 0.163636C15.4745 0.327273 12.0538 0.981818 8.95892 2.94545C2.28045 7.2 0 15.3818 0 27C0 38.6182 2.28045 46.8 8.95892 51.0545C12.0538 53.0182 15.4745 53.6727 18.4065 53.8364C20.5241 54 22.8045 54 24.9221 54C25.5737 54 26.3881 54 26.8768 54C35.347 54 42.8399 50.0727 47.7266 44.0182L54.4051 35.8364L51.1473 31.7455L50.3329 30.7636L50.0071 30.4364L42.8399 39.9273C39.0935 44.6727 33.2295 47.6182 26.7139 47.6182C25.8994 47.6182 25.085 47.6182 24.4334 47.6182C14.1714 47.7818 6.1898 47.7818 6.1898 26.8364C6.1898 5.89091 14.1714 6.05455 24.5963 6.21818C25.4108 6.21818 26.2252 6.21818 26.8768 6.21818C33.3924 6.21818 39.0935 9.16364 43.0028 13.9091L51.636 24.5455L53.7535 27.1636L57.5 31.9091L67.2734 44.0182C72.1601 50.0727 79.653 54 88.1232 54C88.7748 54 89.4263 54 90.0779 54C92.1955 54 94.4759 54 96.5935 53.8364C99.5255 53.6727 102.946 53.0182 106.041 51.0545C112.72 46.8 115 38.6182 115 27C115 15.3818 112.72 7.2 106.041 2.94545Z"
        fill={`url(#paint${id})`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 29C9 27.9231 10.1667 27 11.5 27H16.5C17.8333 27 19 27.9231 19 29C19 30.0769 17.8333 31 16.5 31H11.5C10.1667 31 9 30.0769 9 29Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33 32C33 30.9231 34.1667 30 35.5 30H40.5C41.8333 30 43 30.9231 43 32C43 33.0769 41.8333 34 40.5 34H35.5C34 34 33 33.0769 33 32Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 22C21 20.9231 22.1667 20 23.5 20H28.5C29.8333 20 31 20.9231 31 22C31 23.0769 29.8333 24 28.5 24H23.5C22 24 21 23.0769 21 22Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 25V15C16 13.9231 15.0769 13 14 13C12.9231 13 12 13.9231 12 15V25H16Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 33V38.5238C12 39.8571 12.9231 41 14 41C15.0769 41 16 39.8571 16 38.5238V33H12Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28 18V15.1667C28 14 27.0769 13 26 13C24.9231 13 24 14 24 15.1667V18H28Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M40 28V15.191C40 14.0112 39.0769 13 38 13C36.9231 13 36 13.8427 36 15.191V28H40Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 26L24 38.809C24 39.9888 24.9231 41 26 41C27.0769 41 28 40.1573 28 38.809L28 26L24 26Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36 36V38.9687C36 40.0625 36.9231 41 38 41C39.0769 41 40 40.0625 40 38.9687V36H36Z"
        fill="var(--infinite-logo-color-stop-1,#3BFF7F)"
      />
      <defs>
        <linearGradient
          id={`paint${id}`}
          x1="-3"
          y1="27"
          x2="115"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--infinite-logo-color-stop-1,#3BFF7F)" />
          <stop
            offset="1"
            stopColor="var(--infinite-logo-color-stop-2,#497AFF)"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
