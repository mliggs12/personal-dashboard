import { useMutation } from "convex/react"
import dayjs from "dayjs"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"


type StatementTableProps = {
  statements: {
    id: string
    text: string
    updated: number
    created: number
  }[]
}

export default function StatementTable({ statements }: StatementTableProps) {
  const router = useRouter();

  const deleteStatement = useMutation(api.statements.remove)

  return (
    <Table>
      <TableCaption>A list of mind dump statements from today.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">ID</TableHead>
          <TableHead>Statement</TableHead>
          <TableHead className="w-32">Updated</TableHead>
          <TableHead className="w-32">Created</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statements.map((statement, index) => (
          <TableRow key={statement.id}>
            <TableCell className="w-12">{index + 1}</TableCell>
            <TableCell>{statement.text}</TableCell>
            <TableCell className="w-32">{dayjs(statement.updated).format("MMM DD")}</TableCell>
            <TableCell className="w-32">{dayjs(statement.created).format("MMM DD")}</TableCell>
            <TableCell className="w-16">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                  >
                    <MoreHorizontal />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onSelect={() => router.push(`/dashboard/me5/list/${statement.id}`)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Create Focus Block
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => deleteStatement({ id: statement.id as Id<"statements"> })}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}