import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

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
      { error: "Failed to read CSV file" },
      { status: 500 }
    );
  }
}

