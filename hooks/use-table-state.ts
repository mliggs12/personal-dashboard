import { useCallback, useEffect, useMemo, useRef } from "react";
import { ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

interface TableState {
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  sorting?: SortingState;
  pagination?: {
    pageSize: number;
  };
}

interface UseTableStateOptions {
  defaultFilters?: ColumnFiltersState;
  defaultVisibility?: VisibilityState;
  defaultSorting?: SortingState;
  defaultPageSize?: number;
}

interface UseTableStateReturn {
  savedState: TableState | null | undefined;
  onStateChange: (state: TableState) => void;
}

export function useTableState(
  tableId: string,
  options: UseTableStateOptions = {}
): UseTableStateReturn {
  const {
    defaultFilters = [],
    defaultVisibility = {},
    defaultSorting = [],
    defaultPageSize = 10,
  } = options;

  const savedState = useQuery(api.tableStates.get, { tableId });
  const upsertState = useMutation(api.tableStates.upsert);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Merge saved state with defaults
  const mergedState = useMemo(() => {
    if (savedState === undefined) return undefined;
    
    return {
      columnFilters: savedState?.columnFilters ?? defaultFilters,
      columnVisibility: savedState?.columnVisibility ?? defaultVisibility,
      sorting: savedState?.sorting ?? defaultSorting,
      pagination: savedState?.pagination ?? { pageSize: defaultPageSize },
    };
  }, [savedState, defaultFilters, defaultVisibility, defaultSorting, defaultPageSize]);

  const onStateChange = useCallback(
    (state: TableState) => {
      // Debounce the save to Convex
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        upsertState({ tableId, state });
      }, 500);
    },
    [tableId, upsertState]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    savedState: mergedState,
    onStateChange,
  };
}

