export const metadata = {
  title: "Reverse Dictionary",
  description: "Daily word-from-definition puzzle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}