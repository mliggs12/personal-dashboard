import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface IntentionSelectProps {
  onIntentionSelect?: (intention: Doc<"intentions"> | null) => void;
  onIntentionIdSelect?: (intentionId: Id<"intentions"> | null) => void;
}

export default function IntentionSelect({ 
  onIntentionSelect, 
  onIntentionIdSelect 
}: IntentionSelectProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedIntentionId, setSelectedIntentionId] = useState<string>("");

  const searchResults = useQuery(api.intentions.search, { query: searchText }) || [];
  const createIntention = useMutation(api.intentions.create)
  const intention = useQuery(api.intentions.get,
    selectedIntentionId ? { id: selectedIntentionId as Id<"intentions"> } : "skip"
  )
  const emotions = useQuery(api.emotions.list);

  const getEmotionColor = (emotionId: string) => {
    const emotion = emotions?.find((e) => e._id === emotionId);
    if (!emotion) return "#6c757d"; // Subtle gray color if emotion not found

    if (!emotion.color) {
      // Assign a subtle color if none exists
      switch (emotion.label.toLowerCase()) {
        case "freedom":
          return "#4a90e2"; // Subtle blue
        case "fullness":
          return "#8e44ad"; // Subtle purple
        case "passion":
          return "#c0392b"; // Subtle red
        case "joy":
          return "#f39c12"; // Subtle yellow
        case "enjoyment":
          return "#27ae60"; // Subtle green
        case "enthusiasm":
          return "#d35400"; // Subtle orange
        default:
          return "#6c757d"; // Subtle gray
      }
    }

    return emotion.color;
  };


  const handleClick = async () => {
    const id = await createIntention({ title: searchText });
    setSelectedIntentionId(id);
    setSearchText("");
    
    // Notify parent components
    onIntentionIdSelect?.(id);
    // We'll need to fetch the created intention to pass it up
  };

  return (
    <div>
      <div className="mb-4 text-center text-5xl">
        {selectedIntentionId ? (
          <h2 className="flex items-center justify-center gap-3">
            {intention?.emotionId && (
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
              />
            )}
            <Link href={`dashboard/creativity/intentions/${selectedIntentionId}`}>
              {intention ? intention.title : "Loading..."}
            </Link>
          </h2>
        ) : (
          <h2>
            Select intention
          </h2>
        )}
      </div>
      <div className="relative">
        <div className="input-wrapper relative">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Intention"
            className="w-full text-gray-900 dark:text-gray-100"
          />
          {searchText.length >= 1 && (
            <div className="flex flex-col items-center justify-center h-full">
              <Button onClick={handleClick} variant="ghost" className="absolute right-0 top-0">
                <span className="text-sm">Create new intention</span>
              </Button>
            </div>
          )}
        </div>
        {searchResults.length > 0 && (
          <div 
            className="absolute z-99 top-full left-0 right-0 bg-background rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {searchResults.map((result) => (
              <div 
                key={result._id} 
                onClick={() => {
                  setSelectedIntentionId(result._id);
                  setSearchText("");
                  
                  // Notify parent components
                  onIntentionSelect?.(result);
                  onIntentionIdSelect?.(result._id);
                }} 
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 border flex items-center"
              >
                {result.emotionId && (
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                  />
                )}
                <span>
                  {result.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
