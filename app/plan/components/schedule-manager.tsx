import { useMutation, useQuery } from "convex/react";
import { useSchedule } from "./schedule-context";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";
import ScheduleTable from "./schedule-table";
import { useDebounce } from "@/hooks/use-debounce";

export default function ScheduleManager({
  scheduleId,
}: {
  scheduleId: Id<"schedules">;
}) {
  const { state, dispatch } = useSchedule();
  const schedule = useQuery(api.schedules.get, { scheduleId });
  const scheduleActivities =
    useQuery(api.schedules.getOrderedActivities, { scheduleId }) ?? [];
  const updateActivity = useMutation(api.activities.updateActivity);
  const debouncedActivities = useDebounce(state.activities, 1000);

  useEffect(() => {
    if (schedule && state.scheduleId !== schedule._id) {
      dispatch({ type: "SET_SCHEDULE", payload: { scheduleId: schedule._id } });
    }
  }, [schedule, dispatch]);

  useEffect(() => {
    if (scheduleActivities.length > 0) {
      dispatch({ type: "SET_ACTIVITIES", payload: scheduleActivities });
    }
  }, [scheduleActivities, dispatch]);

  useEffect(() => {
    if (state.isDirty) {
      debouncedActivities.forEach((activity) => {
        const scheduleActivity = scheduleActivities.find(
          (a) => a._id === activity._id,
        );
        if (scheduleActivity) {
          const updates = Object.entries(activity).reduce(
            (acc, [key, value]) => {
              if (
                value !== scheduleActivity[key as keyof typeof scheduleActivity]
              ) {
                acc[key as keyof typeof activity] = value;
              }
              return acc;
            },
            {} as Partial<typeof activity>,
          );

          if (Object.keys(updates).length > 0) {
            updateActivity({ activityId: activity._id, ...updates });
          }
        }
      });
      dispatch({ type: "MARK_CLEAN" });
    }
  }, [
    debouncedActivities,
    scheduleActivities,
    updateActivity,
    dispatch,
    state.isDirty,
  ]);

  if (schedule === undefined || scheduleActivities === undefined) {
    return <p>Loading...</p>;
  }
}
