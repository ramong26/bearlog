interface MainProps {
  children: React.ReactNode;
}
export default function Main({ children }: MainProps) {
  return (
    <main
      className={`min-w-0 flex-1 overflow-x-hidden px-4 py-8 pt-8 pr-[16px] pl-[15px] transition-all duration-300 lg:pt-12 lg:pr-[26px] lg:pl-6 xl:pt-20 xl:pr-[158px] xl:pl-[88px]`}
    >
      {children}
    </main>
  );
}
