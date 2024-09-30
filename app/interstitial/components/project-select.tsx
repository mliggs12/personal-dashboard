import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "@/convex/_generated/dataModel";

export default function ProjectSelect({
  projects,
}: {
  projects: Doc<"projects">[];
}) {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem
            key={project._id}
            value={project.name}
          >
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
