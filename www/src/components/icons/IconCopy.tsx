type IconProps = {
  size?: number;
  className?: string;
};
export function IconCopy(props: IconProps) {
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
      <path d="M360-240q-29.7 0-50.85-21.15Q288-282.3 288-312v-480q0-29.7 21.15-50.85Q330.3-864 360-864h384q29.7 0 50.85 21.15Q816-821.7 816-792v480q0 29.7-21.15 50.85Q773.7-240 744-240H360ZM216-96q-29.7 0-50.85-21.15Q144-138.3 144-168v-552h72v552h456v72H216Z" />
    </svg>
  );
}
