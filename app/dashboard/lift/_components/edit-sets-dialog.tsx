import { AlarmClock, EllipsisVertical, Info, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import Setter from "./setter";

export default function EditSetsDialog({ exerciseName }: { exerciseName: string }) {
  return (
    <>
      <div className="page">
        <div className="header">
          <div className="navigation flex w-full items-center justify-between">
            <Button variant="ghost">{exerciseName}</Button>
            <Button variant="ghost" className="[&_svg]:size-7">
              <AlarmClock />
            </Button>
            <Button variant="ghost" className="[&_svg]:size-7">
              <Trophy />
            </Button>
            <Button variant="ghost" className="[&_svg]:size-7">
              <Info />
            </Button>
            <Button variant="ghost" className="[&_svg]:size-7">
              <EllipsisVertical />
            </Button>
          </div>
          <div className="tabs">
            <Tabs defaultValue="track">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="track" className="uppercase">track</TabsTrigger>
                <TabsTrigger value="history" className="uppercase">history</TabsTrigger>
                <TabsTrigger value="graph" className="uppercase">graph</TabsTrigger>
              </TabsList>
              <TabsContent value="track">
                <Setter />
              </TabsContent>
              <TabsContent value="history">History</TabsContent>
              <TabsContent value="graph">Graph</TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
