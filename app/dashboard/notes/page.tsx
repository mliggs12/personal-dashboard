import { preloadQuery } from "convex/nextjs";

import { getAuthToken } from "@/app/auth";
import { api } from "@/convex/_generated/api";

import NotesPage from "./notes";

const ServerNotesPage = async () => {
  const token = await getAuthToken();
  const preloadedNotes = await preloadQuery(api.notes.list, {}, { token });

  return <NotesPage preloadedNotes={preloadedNotes} />;
};

export default ServerNotesPage;
