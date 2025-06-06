export const Blockquote = ({
  children,
  ...props
}: React.JSX.IntrinsicElements['blockquote']) => {
  return (
    <>
      <blockquote
        className="mdx-blockquote py-4 px-8 my-8 shadow-inner bg-highlight-dark/50 rounded-lg leading-6 flex relative"
        {...props}
      >
        <span className="block relative">{children}</span>
      </blockquote>
      {/* @ts-ignore */}
      <style jsx global>{`
        .mdx-blockquote > span > p:first-of-type {
          margin-bottom: 0;
        }
        .mdx-blockquote > span > p:last-of-type {
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
};
