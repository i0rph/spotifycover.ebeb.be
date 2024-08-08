import Footer from '@/app/footer';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-auto">{children}</main>
      <Footer />
    </div>
  );
}
