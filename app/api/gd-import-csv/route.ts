import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "app", "dashboard", "gd", "import", "Galaxy Defense - Enemy List.csv");
    const fileContents = await readFile(filePath, "utf-8");
    return new NextResponse(fileContents, {
      headers: {
        "Content-Type": "text/csv",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to read CSV file: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

