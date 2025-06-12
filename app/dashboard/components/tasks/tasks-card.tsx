"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import dayjs from "dayjs";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import AddTaskDrawerDialog from "./add-task-drawer-dialog";
import TaskList from "./task-list";

function orderTasks(tasks: Doc<"tasks">[]) {
  // Order tasks: first by deadline (if exists), then by updated timestamp
  const orderedTasks = tasks.sort((a, b) => {
    // If neither task has a deadline, sort by updated timestamp (newest first)
    if (!a.due && !b.due) {
      return dayjs(b.updated).valueOf() - dayjs(a.updated).valueOf();
    }
    // If only one task has a deadline, prioritize the task with deadline
    if (!a.due) return 1; // a goes after b
    if (!b.due) return -1; // a goes before b

    // If both tasks have deadlines, compare them
    const dateComparison = dayjs(a.due).valueOf() - dayjs(b.due).valueOf();
    // If deadlines are the same, sort by updated timestamp
    return dateComparison === 0
      ? dayjs(b.updated).valueOf() - dayjs(a.updated).valueOf()
      : dateComparison;
  });

  return orderedTasks;
}

export default function TasksCard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { results, status, loadMore } = usePaginatedQuery(
    api.tasks.getTasks,
    {},
    { initialNumItems: itemsPerPage },
  )

  // Calculate pagination for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = results.slice(startIndex, endIndex);
  const orderedTasks = orderTasks(currentTasks);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    const requiredItems = page * itemsPerPage;
    if (results.length < requiredItems && status === "CanLoadMore") {
      const itemsToLoad = requiredItems - results.length;
      loadMore(itemsToLoad);
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    } else if (status === "CanLoadMore") {
      // Load more items and advance to next page
      loadMore(itemsPerPage);
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Card className="relative max-h-[481px]">
      <CardHeader className="flex-row items-center justify-between p-3">
        <CardTitle>My tasks</CardTitle>
        <Button
          asChild
          size="sm"
          variant="link"
          className="p-0 gap-1 text-primary-foreground underline"
        >
          <Link href="/dashboard/tasks">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="h-[345px] p-0 border-t">
        <TaskList tasks={orderedTasks} />
      </CardContent>
      <CardFooter className="h-[69px] flex items-center p-3 px-6">
        {/* Status Info */}
        <div className="w-[120px] flex shrink-0 text-nowrap text-sm text-gray-500 text-center">
          Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length}
        </div>

        {results.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#"
                  onClick={handlePrevious}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" className="cursor-default">
                  {currentPage}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext href="#"
                  onClick={handleNext}
                  className={
                    (currentPage >= totalPages && status === "Exhausted")
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  } />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        <div className="absolute right-2 bottom-12 z-10">
          <AddTaskDrawerDialog />
        </div>
      </CardFooter>
    </Card>
  );
}
