type IconProps = {
  size?: number;
  className?: string;
};
export function IconCheck(props: IconProps) {
  const size = props.size || 20;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={`${size}px`}
      viewBox="0 -960 960 960"
      width={`${size}px`}
      fill="currentColor"
      className={props.className}
    >
      <path d="M389-267 195-460l51-52 143 143 325-324 51 51-376 375Z" />
    </svg>
  );
}
