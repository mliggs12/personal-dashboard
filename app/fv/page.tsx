import { redirect } from "next/navigation";

export default async function FVPage() {
  return redirect("/fv/tasks");
}
