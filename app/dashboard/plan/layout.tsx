import MobileNavbar from "./components/mobile-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();
  // const isMobile = useIsMobile();

  return (
    <div className="h-full">
      {children}
      <MobileNavbar />
    </div>
  )
}