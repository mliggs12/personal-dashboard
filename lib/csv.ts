import { parse } from "csv-parse/sync";
import fs from "fs/promises";

export interface CsvRecord {
  Date: string;
  Description: string;
  Comments: string;
  "Check Number": string;
  Amount: string;
  Balance: string;
}

export interface Transaction {
  date: string;
  description: string;
  checkNumber: string;
  amount: string;
  balance: string;
}

export async function getCSVData(): Promise<CsvRecord[]> {
  try {
    const filePath = "./data/ent_20240720.csv";
    const fileContent = await fs.readFile(filePath, "utf-8");

    const records: CsvRecord[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new Error("No records found in CSV file");
    }

    return records.reverse();
  } catch (error) {
    console.error(error);

    return [];
  }
}

export async function getAccountData(): Promise<Transaction[]> {
  const csvData: CsvRecord[] = await getCSVData();

  return csvData.map((record) => ({
    date: record.Date,
    description: record.Description,
    checkNumber: record["Check Number"],
    amount: record.Amount,
    balance: record.Balance,
  }));
}
