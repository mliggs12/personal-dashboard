import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

export async function getProjectNames() {
  const projects = await fetchQuery(api.projects.list);
  return projects.map((project) => project.name);
}

export async function createProject(name: string, color: string) {
  return await fetchMutation(api.projects.create, { name, color });
}
