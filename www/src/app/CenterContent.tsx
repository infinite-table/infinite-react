export function CenterContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full lg:pt-0  pl-0 lg:pl-80 2xl:px-80 article">
        <div className="max-w-7xl px-4 sm:px-12 mx-auto w-full container pt-4 ">
          {children}
        </div>
      </div>

      <div className="pt-20 w-full lg:max-w-xs lg:sticky top-0 h-full hidden xl:block"></div>
    </>
  );
}
