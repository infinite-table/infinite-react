type IconProps = {
  size?: number;
  className?: string;
};
export function IconCodeBlock(props: IconProps) {
  return (
    <svg
      className={props.className}
      width="1em"
      height="0.8em"
      viewBox="0 0 24 18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 9L18.343 14.657L16.929 13.243L21.172 9L16.929 4.757L18.343 3.343L24 9ZM2.828 9L7.071 13.243L5.657 14.657L0 9L5.657 3.343L7.07 4.757L2.828 9ZM9.788 18H7.66L14.212 0H16.34L9.788 18Z"
        fill="currentColor"
      />
    </svg>
  );
}
