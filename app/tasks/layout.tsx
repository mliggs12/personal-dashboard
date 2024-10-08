export default function FVLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex gap-24 container mx-auto pt-6">{children}</div>;
}
