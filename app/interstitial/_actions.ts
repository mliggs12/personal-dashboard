import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

type AllowedColors =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "pink"
  | "purple"
  | "orange";

export async function getProjectNames() {
  const projects = await fetchQuery(api.projects.list);
  return projects.map((project) => project.name);
}

export async function createProject(name: string, color: AllowedColors) {
  return await fetchMutation(api.projects.create, { name, color });
}
