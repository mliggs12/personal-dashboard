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

export interface AccountDataTableProps {
  data: Transaction[];
}
