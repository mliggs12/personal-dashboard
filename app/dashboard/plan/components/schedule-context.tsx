import React, { createContext, Dispatch, useContext, useReducer } from "react";

import { Doc, Id } from "@/convex/_generated/dataModel";

interface ScheduleState {
  activities: Doc<"activities">[];
  scheduleId: Id<"schedules"> | null;
  isDirty: boolean;
}

type Action =
  | { type: "SET_SCHEDULE_ID"; scheduleId: Id<"schedules"> }
  | { type: "SET_ACTIVITIES"; activities: Doc<"activities">[] }
  | {
      type: "UPDATE_ACTIVITY_LENGTH";
      activityId: Id<"activities">;
      length: number;
    }
  | { type: "MARK_CLEAN" };

const initialState: ScheduleState = {
  activities: [],
  scheduleId: null,
  isDirty: false,
};

const ScheduleContext = createContext<
  | {
      state: ScheduleState;
      dispatch: Dispatch<Action>;
    }
  | undefined
>(undefined);

function recalculateSchedule(state: ScheduleState): ScheduleState {
  let currentStart = 0;
  const updatedActivities = state.activities
    .sort((a, b) => a.index - b.index)
    .map((activity) => {
      const updatedActivity = { ...activity, start: currentStart };
      currentStart += activity.length;

      return updatedActivity;
    });
  return { ...state, activities: updatedActivities, isDirty: true };
}

function scheduleReducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case "SET_SCHEDULE_ID":
      return {
        ...state,
        scheduleId: action.scheduleId,
        isDirty: false,
      };
    case "SET_ACTIVITIES":
      return {
        ...state,
        activities: action.activities,
        isDirty: false,
      };
    case "UPDATE_ACTIVITY_LENGTH":
      const updatedActivities = state.activities.map((activity) => {
        if (activity._id === action.activityId) {
          return { ...activity, length: action.length };
        }
        return activity;
      });
      return recalculateSchedule({ ...state, activities: updatedActivities });
    case "MARK_CLEAN":
      return { ...state, isDirty: false };
    default:
      return state;
  }
}

export default function SchedulePovider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  return (
    <ScheduleContext.Provider value={{ state, dispatch }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
