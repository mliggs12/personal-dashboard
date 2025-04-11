"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface FocusBlockProps {
  focusBlock?: Doc<"focusBlocks"> | null;
  statements?: Doc<"statements">[] | null;
}

export function FocusBlock({ focusBlock, statements }: FocusBlockProps) {
  const [statementInputs, setStatementInputs] = useState<string[]>(Array(12).fill(""));
  const [endStatement, setEndStatement] = useState<string>("");
  const [isEditingEndStatement, setIsEditingEndStatement] = useState<boolean>(false);
  const addStatement = useMutation(api.focusBlocks.addStatement);
  const updateFocusBlock = useMutation(api.focusBlocks.update);
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(12).fill(null));

  // Initialize end statement input when focusBlock changes
  useEffect(() => {
    if (focusBlock?.endStatement) {
      setEndStatement(focusBlock.endStatement);
    } else {
      setEndStatement("");
      setIsEditingEndStatement(!focusBlock?.endStatement);
    }
  }, [focusBlock]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" && statementInputs[index] !== "" && focusBlock) {
      addStatement({
        id: focusBlock._id,
        text: statementInputs[index]
      }).then(() => {
        toast({
          title: "Statement added",
          description: "Your statement has been added to the focus block.",
          duration: 3000,
        });

        // Clear the input
        const newInputs = [...statementInputs];
        newInputs[index] = "";
        setStatementInputs(newInputs);

        // Focus on the next input if available
        if (index < 11 && inputRefs.current[index + 1]) {
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus();
          }, 0);
        }
      }).catch(error => {
        toast({
          title: "Error",
          description: "Failed to add statement: " + error.message,
          variant: "destructive",
          duration: 5000,
        });
      });
    }
  };

  const handleInputChange = (value: string, index: number) => {
    const newInputs = [...statementInputs];
    newInputs[index] = value;
    setStatementInputs(newInputs);
  };

  // Get the intention if this focus block is related to one
  const intention = useQuery(
    api.intentions.get,
    focusBlock?.intentionId ? { intentionId: focusBlock.intentionId } : "skip"
  );

  return (
    <div className="focus-block flex flex-col h-[1050px] w-[850px] p-2">
      {intention && (
        <div className="mb-2 text-sm">
          <span className="text-gray-500">From intention: </span>
          <Link
            href={`/dashboard/creativity/intentions/${intention._id}`}
            className="text-blue-500 hover:underline"
          >
            {intention.title || "Untitled Intention"}
          </Link>
        </div>
      )}
      <div className="header grid grid-cols-12 items-center">
        <div className="question col-span-3 dark:prose-invert font-semibold prose pl-1">What is bothering me?</div>
        <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center border border-b-0 px-2">
          {focusBlock ? focusBlock.startStatement : <div className="animate-pulse h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>}
        </div>
        <div className="question col-span-3 dark:prose-invert font-semibold prose pl-1">How do I want to feel instead?</div>
        <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center border border-b-0 px-2">
          {focusBlock ? (
            !focusBlock.endStatement || isEditingEndStatement ? (
              <Input
                value={endStatement}
                onChange={(e) => setEndStatement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && endStatement.trim() && focusBlock) {
                    updateFocusBlock({
                      id: focusBlock._id,
                      endStatement: endStatement.trim()
                    }).then(() => {
                      setIsEditingEndStatement(false);
                      toast({
                        title: "End statement updated",
                        description: "Your focus block has been updated.",
                        duration: 3000,
                      });
                    }).catch(error => {
                      toast({
                        title: "Error",
                        description: "Failed to update end statement: " + error.message,
                        variant: "destructive",
                        duration: 5000,
                      });
                    });
                  }
                }}
                placeholder="I want to feel..."
                className="border-none h-10 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base"
              />
            ) : (
              <div className="flex justify-between w-full">
                <span>{focusBlock.endStatement}</span>
                <span
                  className="text-xs text-blue-500 hover:underline cursor-pointer"
                  onClick={() => setIsEditingEndStatement(true)}
                >
                  Edit
                </span>
              </div>
            )
          ) : (
            <div className="animate-pulse h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          )}
        </div>
      </div>

      <div className="body border border-b-0">
        <ol>
          {[...Array(12)].map((_, i) => {
            const statement = statements ? statements[i] : undefined;
            const isLoading = statements === undefined || statements === null;
            return (
              <li key={i} className="grid grid-cols-12 h-14 items-center justify-end border-b last:border-b-0">
                <div className="index col-start-3 prose dark:prose-invert text-3xl font-semibold">{i + 1}</div>
                {isLoading ? (
                  <div className="statement col-span-9 prose dark:prose-invert  px-2">
                    <div className="animate-pulse h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                ) : statement ? (
                  <div className="statement col-span-9 prose dark:prose-invert px-2">
                    {statement.text}
                  </div>
                ) : (
                  <div className="statement col-span-9 prose dark:prose-invert px-2">
                    <Input
                      ref={el => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      value={statementInputs[i]}
                      onChange={(e) => handleInputChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      disabled={i > 0 && !statements?.[i - 1]}
                      className={`border-none h-10 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base ${i > 0 && !statements?.[i - 1] ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="footer grid grid-cols-12 items-center border">
        <div className="question flex col-span-3 font-medium prose dark:prose-invert items-center text-center text-sm text-primary bg-secondary/75 h-full mr-1">
          <div className="w-[148px] ml-4">Best-Feeling Thought From This Block</div>
        </div>
        <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center  px-1">
          {statements === undefined || statements === null ? (
            <div className="animate-pulse h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          ) : (
            /* Best feeling thought logic here */
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
