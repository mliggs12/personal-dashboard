import { getAccountData } from "@/lib/csv";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import AccountDataTable from "./account-data-table";

export default async function AccountDataCard() {
  const data = await getAccountData();

  return (
    <Card className="max-w-7xl">
      <CardHeader>
        <CardTitle>ENT Checking Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <AccountDataTable data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
