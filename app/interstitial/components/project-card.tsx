"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Link } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  title: string;
  color: string;
  count?: number;
  totalDuration?: number;
  _creationTime: number;
  _id: any;
}

export default function ProjectCard({
  title,
  color,
  count,
  totalDuration,
  _creationTime,
  _id,
}: ProjectCardProps) {
  const deleteProject = useMutation(api.projects.remove);

  return (
    <Link
      href={`/sessions/${_id}`}
      className="mx-2 flex items-center justify-between border-[0.5px] border-[#00000050] bg-white px-[23px] py-[17px] transition hover:bg-gray-100 md:w-full"
    >
      <div className="flex w-fit items-center gap-[23px]">
        <div className="hidden items-center justify-center rounded-[50%] bg-dark p-2.5 md:flex ">
          <Image
            src=""
            width={20}
            height={20}
            alt="file"
            className="h-5 w-5 md:h-[20px] md:w-[20px]"
          />
        </div>
        <h1
          className={cn(
            "text-[17px] font-light text-dark md:text-xl lg:text-2xl",
            "leading-[114.3%] tracking-[-0.6px]",
          )}
        >
          {title}
        </h1>
      </div>
      <div className="flex w-fit items-center gap-x-[40px] 2xl:gap-x-[56px]">
        <h3 className="hidden text-xl font-[200] leading-[114.3%] tracking-[-0.5px] md:inline-block">
          {new Date(_creationTime).toDateString()}
        </h3>
        <h3 className="hidden text-xl font-[200] leading-[114.3%] tracking-[-0.5px] md:inline-block">
          {count} sessions
        </h3>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            deleteProject({ projectId: _id });
          }}
          className="flex h-fit w-fit cursor-pointer items-center justify-center gap-5 bg-transparent p-2 transition hover:scale-125 md:inline-block"
        >
          <Image
            src=""
            alt="delete"
            width={20}
            height={20}
          />
        </Button>
      </div>
    </Link>
  );
}
