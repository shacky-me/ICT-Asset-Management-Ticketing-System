import Footer from "@/components/Footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center overflow-hidden px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
