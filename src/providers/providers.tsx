import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/providers/react-query';
import { ThemeProvider } from '@/providers/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <Toaster />
      <ThemeProvider>{children}</ThemeProvider>
    </ReactQueryProvider>
  );
}
