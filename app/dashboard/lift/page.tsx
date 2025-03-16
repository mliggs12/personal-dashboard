"use client"

import { useQuery } from "convex/react";
import { CalendarDays, ChevronLeft, ChevronRight, EllipsisVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { AddExerciseDialog } from "./_components/add-exercise-dialog";
import EditSetsDialog from "./_components/edit-sets-dialog";
import WorkoutLog from "./_components/workout-log";

// function ExerciseCard({ exercise }: { exercise: Doc<"systemExercises"> }) {
//   const { } = exercise;

//   return (
//     <div className="border bg-secondary">
//       <div className="item-title border-b border-primary text-lg p-2 px-3">{name}</div>
//       <div className="item-body p-[6px] px-3 flex flex-col gap-[7px]">
//         {sets.map((set, index) => (
//           <div key={index} className="item-row grid grid-cols-3 text-right">
//             <div className="item-cell col-start-2 font-semibold text-lg">
//               {set.weight}<span className="ml-1 text-sm text-gray-400 font-normal">lbs</span>
//             </div>
//             <div className="item-cell font-semibold text-lg">
//               {set.reps}<span className="ml-1 text-sm text-gray-400 font-normal">reps</span>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="view-more pr-3 pb-[3px] pt-1 text-right text-sm text-gray-500">{sets.length} more</div>
//     </div>
//   );
// }

// function ExerciseList() {
//   const { date, exercises } = exerciseData;


//   return (
//     <div className="log-body p-5 flex flex-col gap-[22px]">
//       {exercises.map((exercise, index) => (
//         <ExerciseCard key={index} exercise={exercise} />
//       ))}
//     </div>
//   );
// }


export default function Lift() {
  const systemExercises = useQuery(api.systemExercises.list);

  if (systemExercises === undefined) {
    return <div>Loading...</div>
  }
  return (
    <div className="h-full">
      <div className="lift-app max-w-md mx-auto h-full border prose dark:prose-invert">
        <div className="home-header h-[49px] flex justify-between items-center border-b-2">
          <div className="logo">
            <Button size="default" variant="ghost" className="text-xl font-normal">Lift</Button>
          </div>
          <div className="menu-items flex items-center">
            <Button variant="ghost" className="[&_svg]:size-7">
              <CalendarDays />
            </Button>
            <AddExerciseDialog />
            <Button variant="ghost" className="[&_svg]:size-7">
              <EllipsisVertical />
            </Button>
          </div>
        </div>
        <div className="log-select h-[46px] flex justify-between items-center border-b-[3px] border-primary">
          <Button variant="ghost" size="icon" className="text-primary [&_svg]:size-9">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" className="uppercase">
            Today
          </Button>
          <Button variant="ghost" size="icon" className="text-primary [&_svg]:size-9">
            <ChevronRight />
          </Button>
        </div>
        <div className="log-body p-5 flex flex-col gap-[22px]">
          {systemExercises.length === 0 ? (
            <div>Workout Log Empty</div>
          ) : (
            // <WorkoutLog />
            <EditSetsDialog exerciseName="Barbell Squat" />
          )
          }
        </div>
      </div>
    </div>
  );
}
