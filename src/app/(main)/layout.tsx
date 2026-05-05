import { SidebarProvider } from '@/shared/contexts/SidebarContext';
import Sidebar from '@/shared/components/Sidebar';
import Main from '@/shared/components/Main';

interface MainLayoutProps {
  children: React.ReactNode;
}
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-full min-h-screen flex-col bg-[#F2F2F2] dark:bg-gray-900 md:flex-row">
        <Sidebar />
        <div id="mobile-toolbar-slot" className="md:hidden" />
        <Main>{children}</Main>
      </div>
    </SidebarProvider>
  );
}
