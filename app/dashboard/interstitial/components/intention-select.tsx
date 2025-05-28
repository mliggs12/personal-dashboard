import { useMutation, useQuery } from "convex/react"
import Link from "next/link";
import { useState } from "react"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api"

export default function IntentionSelect() {
  const [searchText, setSearchText] = useState("");
  const [selectedIntentionId, setSelectedIntentionId] = useState<string | null>(null);

  const searchResults = useQuery(api.intentions.search, { query: searchText }) || [];
  const createIntention = useMutation(api.intentions.create)


  const handleClick = async () => {
    const intentionId = await createIntention({ title: searchText });
    setSelectedIntentionId(intentionId);
    setSearchText("");
  };

  return (
    <div>
      <div className="mb-4 text-center text-5xl">
        {selectedIntentionId ? (
          <h2>
            <Link href={`creativity/intentions/${selectedIntentionId}`}>
              {selectedIntentionId}
            </Link>
          </h2>
        ) : (
          <h2>
            Select intention
          </h2>
        )}
      </div>
      <div>
        <div className="input-wrapper relative">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Intention"
            className="w-full"
          />
          {searchText.length >= 1 && (
            <div className="flex flex-col items-center justify-center h-full">
              <Button onClick={handleClick} variant="ghost" className="absolute right-0 top-0">
                <span className="text-sm">Create new intention</span>
              </Button>
            </div>
          )}
        </div>
        <div>
          {searchResults.map((result) => (
            <div key={result._id} onClick={() => {
              setSelectedIntentionId(result._id);
              setSearchText("");
            }} className="cursor-pointer">
              <span>{result.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
