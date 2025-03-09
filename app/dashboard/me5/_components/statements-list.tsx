import { Doc } from "@/convex/_generated/dataModel";

interface StatementsListProps {
  statements: Doc<"statements">[];
}

export default function StatementsList({ statements }: StatementsListProps) {
  return statements.map((statement) => (
    <div key={statement._id}>
      <p>{statement.text}</p>
    </div>
  ));
}
