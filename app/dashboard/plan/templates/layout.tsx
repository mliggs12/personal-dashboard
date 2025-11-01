export default function TemplatesLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6">
      {children}
      {modal}
    </div>
  )
}
