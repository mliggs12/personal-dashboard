"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
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

import EnemyForm from "../components/enemy-form";
import { TypeBadge } from "../components/type-badge";
import { DAMAGE_TYPES } from "../lib/types";

type EnemySortOption = "name-asc" | "name-desc" | "elite-first" | "normal-first";

export default function EnemiesPage() {
  const isMobile = useIsMobile();
  const enemiesQuery = useQuery(api.gdEnemies.list);

  const [enemyDialogOpen, setEnemyDialogOpen] = useState(false);
  const [editingEnemyId, setEditingEnemyId] = useState<Id<"gdEnemies"> | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [eliteFilter, setEliteFilter] = useState<"all" | "elite" | "normal">("all");
  const [damageTypeFilter, setDamageTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<EnemySortOption>("name-asc");

  const filteredEnemies = useMemo(() => {
    const enemies = enemiesQuery ?? [];
    let filtered = [...enemies];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((enemy) =>
        enemy.name.toLowerCase().includes(query) ||
        enemy.feature?.toLowerCase().includes(query) ||
        enemy.weaknesses.some((w) => w.type.toLowerCase().includes(query)) ||
        enemy.resistances.some((r) => r.toLowerCase().includes(query))
      );
    }

    // Filter by elite status
    if (eliteFilter !== "all") {
      filtered = filtered.filter((enemy) =>
        eliteFilter === "elite" ? enemy.elite : !enemy.elite
      );
    }

    // Filter by damage type (weakness or resistance)
    if (damageTypeFilter !== "all") {
      filtered = filtered.filter((enemy) =>
        enemy.weaknesses.some((w) => w.type === damageTypeFilter) ||
        enemy.resistances.includes(damageTypeFilter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "elite-first":
          if (a.elite === b.elite) return a.name.localeCompare(b.name);
          return a.elite ? -1 : 1;
        case "normal-first":
          if (a.elite === b.elite) return a.name.localeCompare(b.name);
          return a.elite ? 1 : -1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [enemiesQuery, searchQuery, eliteFilter, damageTypeFilter, sortBy]);

  // const handleEditEnemy = (enemyId: Id<"gdEnemies">) => {
  //   setEditingEnemyId(enemyId);
  //   setEnemyDialogOpen(true);
  // };

  // const handleDeleteEnemy = async (enemyId: Id<"gdEnemies">) => {
  //   if (confirm("Are you sure you want to delete this enemy?")) {
  //     try {
  //       await deleteEnemy({ enemyId });
  //       toast({
  //         title: "Enemy deleted",
  //         duration: 2000,
  //       });
  //     } catch (error) {
  //       toast({
  //         title: "Error",
  //         description: "Failed to delete enemy",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  // };

  const handleEnemySuccess = () => {
    setEnemyDialogOpen(false);
    setEditingEnemyId(undefined);
  };

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
          <h2 className="text-lg md:text-2xl font-semibold">Enemies</h2>
          <p className="text-sm text-muted-foreground">
            View and manage enemy data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/gd/import">Import CSV</Link>
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
              placeholder="Search by name, feature, or damage type..."
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
            <Select value={damageTypeFilter} onValueChange={setDamageTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Damage Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {DAMAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as EnemySortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="elite-first">Elite First</SelectItem>
                <SelectItem value="normal-first">Normal First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={eliteFilter} onValueChange={(value) => setEliteFilter(value as typeof eliteFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Enemies</TabsTrigger>
            <TabsTrigger value="elite">Elite</TabsTrigger>
            <TabsTrigger value="normal">Normal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      {(searchQuery || eliteFilter !== "all" || damageTypeFilter !== "all") && (
        <div className="text-sm text-muted-foreground">
          Found {filteredEnemies.length} {filteredEnemies.length === 1 ? "enemy" : "enemies"}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredEnemies.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg mb-2">
                {searchQuery ? "No enemies found" : "No enemies yet"}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingEnemyId(undefined);
                    setEnemyDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Enemy
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnemies.map((enemy) => (
              <Card
                key={enemy._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <Link href={`/dashboard/gd/enemies/${enemy._id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{enemy.name}</h3>
                        {enemy.elite && (
                          <Badge variant="outline" className="mt-1">
                            Elite
                          </Badge>
                        )}
                      </div>
                    </div>

                    {enemy.weaknesses.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Weaknesses</p>
                        <div className="flex flex-wrap gap-1">
                          {enemy.weaknesses.map((weakness, idx) => (
                            <TypeBadge
                              key={idx}
                              type={weakness.type}
                              multiplier={weakness.multiplier}
                              variant="weakness"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {enemy.resistances.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Resistances</p>
                        <div className="flex flex-wrap gap-1">
                          {enemy.resistances.map((resistance, idx) => (
                            <TypeBadge
                              key={idx}
                              type={resistance}
                              variant="resistance"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {enemy.feature && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {enemy.feature}
                      </p>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isMobile ? (
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
      ) : (
        <Dialog open={enemyDialogOpen} onOpenChange={setEnemyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {EnemyDialogContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

