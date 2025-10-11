"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import AddFbDrawerDialog from "../components/add-fb-drawer-dialog";
import CreateFocusBlockInput from "../components/create-focus-block-input";

export default function FocusBlocksPage() {
  const focusBlocks = useQuery(api.focusBlocks.list);
  const intentions = useQuery(api.intentions.list);
  const [activeTab, setActiveTab] = useState("all");

  // Group focus blocks by intention
  const groupedFocusBlocks: Record<string, Doc<"focusBlocks">[]> = {};
  const standaloneFocusBlocks: Doc<"focusBlocks">[] = [];

  if (focusBlocks) {
    focusBlocks.forEach(fb => {
      if (fb.intentionId) {
        const intentionId = fb.intentionId;
        if (!groupedFocusBlocks[intentionId]) {
          groupedFocusBlocks[intentionId] = [];
        }
        groupedFocusBlocks[intentionId].push(fb);
      } else {
        standaloneFocusBlocks.push(fb);
      }
    });
  }

  return (
    <div className="flex flex-col min-h-full px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="title prose dark:prose-invert text-2xl font-semibold">Focus Blocks</h2>
        <AddFbDrawerDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Focus Block</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateFocusBlockInput />
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Focus Blocks</TabsTrigger>
          <TabsTrigger value="standalone">Standalone</TabsTrigger>
          <TabsTrigger value="by-intention">By Intention</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {focusBlocks === undefined ? (
            // Loading state
            <div className="space-y-2">
              {Array(3).fill(0).map((_, index) => (
                <div key={`loading-${index}`} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          ) : focusBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No focus blocks yet. Create your first one above!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {focusBlocks.map((fb) => (
                <li key={fb._id} className="border p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <Link
                    href={`/dashboard/creativity/focus-blocks/${fb._id}`}
                    className="block"
                  >
                    <div className="font-medium">{fb.startStatement || "Untitled Focus Block"}</div>
                    {fb.endStatement && (
                      <div className="text-sm text-gray-500 mt-1">→ {fb.endStatement}</div>
                    )}
                    {fb.intentionId && intentions && (
                      <div className="text-xs text-blue-500 mt-1">
                        From intention: {
                          intentions.find(i => i._id === fb.intentionId)?.title || "Unknown Intention"
                        }
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="standalone" className="space-y-4 mt-4">
          {focusBlocks === undefined ? (
            // Loading state
            <div className="space-y-2">
              {Array(2).fill(0).map((_, index) => (
                <div key={`loading-${index}`} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          ) : standaloneFocusBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No standalone focus blocks yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {standaloneFocusBlocks.map((fb) => (
                <li key={fb._id} className="border p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <Link
                    href={`/dashboard/creativity/focus-blocks/${fb._id}`}
                    className="block"
                  >
                    <div className="font-medium">{fb.startStatement || "Untitled Focus Block"}</div>
                    {fb.endStatement && (
                      <div className="text-sm text-gray-500 mt-1">→ {fb.endStatement}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="by-intention" className="space-y-6 mt-4">
          {focusBlocks === undefined || intentions === undefined ? (
            // Loading state
            <div className="space-y-4">
              {Array(2).fill(0).map((_, index) => (
                <div key={`loading-${index}`}>
                  <div className="animate-pulse h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedFocusBlocks).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No focus blocks associated with intentions yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {intentions.map(intention => {
                const intentionFocusBlocks = groupedFocusBlocks[intention._id];
                if (!intentionFocusBlocks || intentionFocusBlocks.length === 0) return null;

                return (
                  <div key={intention._id} className="space-y-2">
                    <h3 className="text-lg font-medium">
                      <Link
                        href={`/dashboard/creativity/intentions/${intention._id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {intention.title || "Untitled Intention"}
                      </Link>
                    </h3>
                    <ul className="space-y-2 ml-4">
                      {intentionFocusBlocks.map((fb) => (
                        <li key={fb._id} className="border p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <Link
                            href={`/dashboard/creativity/focus-blocks/${fb._id}`}
                            className="block"
                          >
                            <div className="font-medium">{fb.startStatement || "Untitled Focus Block"}</div>
                            {fb.endStatement && (
                              <div className="text-sm text-gray-500 mt-1">→ {fb.endStatement}</div>
                            )}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/dashboard/creativity/intentions/${intention._id}`}
                          className="flex items-center text-sm text-blue-500 hover:underline"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Create new focus block for this intention
                        </Link>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
