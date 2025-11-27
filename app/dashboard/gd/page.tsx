"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

import EnemyForm from "./components/enemy-form";
import { StageForm } from "./components/stage-form";
import { StageList } from "./components/stage-list";

type SortOption = "number-asc" | "number-desc" | "enemies-asc" | "enemies-desc";

export default function GDPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const stagesQuery = useQuery(api.gdStages.list);
  const deleteStage = useMutation(api.gdStages.remove);

  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [enemyDialogOpen, setEnemyDialogOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<Id<"gdStages"> | undefined>();
  const [editingEnemyId, setEditingEnemyId] = useState<Id<"gdEnemies"> | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "normal" | "elite">("all");
  const [sortBy, setSortBy] = useState<SortOption>("number-asc");

  const enemiesQuery = useQuery(api.gdEnemies.list);

  // Populate stages with enemy objects
  const stagesWithEnemies = useMemo(() => {
    const enemies = enemiesQuery || [];
    // Create a map of enemy IDs to enemy objects
    const enemyMap = new Map(enemies.map((e) => [e._id, e]));

    const stages = (stagesQuery || []).map((stage) => ({
      ...stage,
      enemies: stage.enemyIds
        .map((id) => enemyMap.get(id))
        .filter((e): e is NonNullable<typeof e> => e !== undefined),
    }));

    // Filter by difficulty
    let filtered = stages;
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((stage) => stage.difficulty === difficultyFilter);
    }

    // Filter by search query (stage number or enemy names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((stage) => {
        const stageNumberMatch = stage.number.toString().includes(query);
        const enemyNameMatch = stage.enemies.some((enemy) =>
          enemy.name.toLowerCase().includes(query)
        );
        return stageNumberMatch || enemyNameMatch;
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "number-asc":
          return a.number - b.number;
        case "number-desc":
          return b.number - a.number;
        case "enemies-asc":
          return a.enemies.length - b.enemies.length;
        case "enemies-desc":
          return b.enemies.length - a.enemies.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [stagesQuery, enemiesQuery, difficultyFilter, searchQuery, sortBy]);

  const handleEditStage = (stageId: Id<"gdStages">) => {
    setEditingStageId(stageId);
    setStageDialogOpen(true);
  };

  const handleDeleteStage = async (stageId: Id<"gdStages">) => {
    if (confirm("Are you sure you want to delete this stage?")) {
      try {
        await deleteStage({ stageId });
        toast({
          title: "Stage deleted",
          duration: 2000,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete stage",
          variant: "destructive",
        });
      }
    }
  };

  const handleStageSuccess = () => {
    setStageDialogOpen(false);
    setEditingStageId(undefined);
  };

  const handleEnemySuccess = () => {
    setEnemyDialogOpen(false);
    setEditingEnemyId(undefined);
  };

  if (stagesQuery === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const StageDialogContent = (
    <StageForm
      stageId={editingStageId}
      onSuccess={handleStageSuccess}
      onCancel={() => {
        setStageDialogOpen(false);
        setEditingStageId(undefined);
      }}
    />
  );

  const EnemyDialogContent = (
    <EnemyForm
      enemyId={editingEnemyId}
      onSuccess={handleEnemySuccess}
      onCancel={() => {
        setEnemyDialogOpen(false);
        setEditingEnemyId(undefined);
      }}
    />
  );

  return (
    <div className="flex h-full flex-col space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-2xl font-semibold">Galaxy Defense Stages</h2>
          <p className="text-sm text-muted-foreground">
            View and manage stage and enemy data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/gd/enemies">View Enemies</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingEnemyId(undefined);
              setEnemyDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Enemy
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by stage number or enemy name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number-asc">Stage # (Low to High)</SelectItem>
                <SelectItem value="number-desc">Stage # (High to Low)</SelectItem>
                <SelectItem value="enemies-asc">Enemies (Fewest)</SelectItem>
                <SelectItem value="enemies-desc">Enemies (Most)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value as typeof difficultyFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Stages</TabsTrigger>
            <TabsTrigger value="normal">Normal</TabsTrigger>
            <TabsTrigger value="elite">Elite</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {stagesWithEnemies.length} {stagesWithEnemies.length === 1 ? "stage" : "stages"}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <StageList
          stages={stagesWithEnemies}
          onEdit={handleEditStage}
          onDelete={handleDeleteStage}
        />
      </div>

      {isMobile ? (
        <>
          <Drawer open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
            <DrawerContent>
              <div className="p-4">
                {StageDialogContent}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer open={enemyDialogOpen} onOpenChange={setEnemyDialogOpen}>
            <DrawerContent>
              <div className="p-4">
                {EnemyDialogContent}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="fixed bottom-6 right-6 z-10"
                onClick={() => {
                  setEditingStageId(undefined);
                  setStageDialogOpen(true);
                }}
              >
                <Plus className="w-8 h-8" />
              </Button>
            </DrawerTrigger>
          </Drawer>
        </>
      ) : (
        <>
          <Dialog 
            open={stageDialogOpen} 
            onOpenChange={setStageDialogOpen}
          >
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              {StageDialogContent}
            </DialogContent>
          </Dialog>
          <Dialog open={enemyDialogOpen} onOpenChange={setEnemyDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {EnemyDialogContent}
            </DialogContent>
          </Dialog>
          <Button
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-6 z-10"
            onClick={() => {
              setEditingStageId(undefined);
              setStageDialogOpen(true);
            }}
          >
            <Plus className="w-8 h-8" />
          </Button>
        </>
      )}
    </div>
  );
}

