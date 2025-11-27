"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown, Minus, Plus, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import EnemyForm from "./enemy-form";
import { TypeBadge } from "./type-badge";

const formSchema = z.object({
  number: z.number().int().positive(),
  difficulty: z.enum(["normal", "elite"]),
  enemyIds: z.array(z.string()).min(1, "At least one enemy is required"),
});

interface StageFormProps {
  stageId?: Id<"gdStages">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StageForm({ stageId, onSuccess, onCancel }: StageFormProps) {
  const { toast } = useToast();
  const createStage = useMutation(api.gdStages.create);
  const updateStage = useMutation(api.gdStages.update);
  const getStage = useQuery(
    api.gdStages.get,
    { stageId: stageId as Id<"gdStages"> }
  );
  const stages = useQuery(api.gdStages.list) ?? [];
  const enemies = useQuery(api.gdEnemies.list) ?? [];

  const [enemySelectOpen, setEnemySelectOpen] = useState(false);
  const [enemyDialogOpen, setEnemyDialogOpen] = useState(false);
  const [enemySearchQuery, setEnemySearchQuery] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: 1,
      difficulty: "normal",
      enemyIds: [],
    },
  });

  // Load stage data if editing
  useEffect(() => {
    if (getStage && stageId) {
      form.reset({
        number: getStage.number,
        difficulty: getStage.difficulty,
        enemyIds: getStage.enemyIds.map((id) => id as string),
      });
    }
  }, [getStage, stageId, form]);

  const selectedEnemyIds = useWatch({
    control: form.control,
    name: "enemyIds",
    defaultValue: [],
  }) ?? [];
  const selectedEnemies = enemies.filter((e) =>
    selectedEnemyIds.includes(e._id as string)
  );

  // Filter enemies by search query
  const filteredEnemies = enemies.filter((enemy) => {
    if (!enemySearchQuery.trim()) return true;
    const query = enemySearchQuery.toLowerCase();
    return (
      enemy.name.toLowerCase().includes(query) ||
      enemy.feature?.toLowerCase().includes(query) ||
      enemy.weaknesses.some((w) => w.type.toLowerCase().includes(query)) ||
      enemy.resistances.some((r) => r.toLowerCase().includes(query))
    );
  });

  // Group enemies by elite status
  const eliteEnemies = filteredEnemies.filter((e) => e.elite);
  const normalEnemies = filteredEnemies.filter((e) => !e.elite);

  const handleEnemyCreated = (newEnemyId: Id<"gdEnemies">) => {
    // Add the newly created enemy to the selected enemies
    const current = form.getValues("enemyIds") || [];
    if (!current.includes(newEnemyId as string)) {
      form.setValue("enemyIds", [...current, newEnemyId as string]);
    }
    setEnemyDialogOpen(false);
    setEnemySelectOpen(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check for duplicate stage (same number + difficulty)
      const duplicateStage = stages.find(
        (s) =>
          s.number === values.number &&
          s.difficulty === values.difficulty &&
          (!stageId || s._id !== stageId)
      );

      if (duplicateStage) {
        toast({
          title: "Duplicate stage",
          description: `Stage ${values.number} (${values.difficulty}) already exists`,
          variant: "destructive",
        });
        return;
      }

      const enemyIds = values.enemyIds.map((id) => id as Id<"gdEnemies">);

      if (stageId) {
        await updateStage({
          stageId,
          number: values.number,
          difficulty: values.difficulty,
          enemyIds,
        });
        toast({
          title: "Stage updated",
          duration: 2000,
        });
      } else {
        await createStage({
          number: values.number,
          difficulty: values.difficulty,
          enemyIds,
        });
        toast({
          title: "Stage created",
          duration: 2000,
        });
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save stage",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>{stageId ? "Edit Stage" : "Create Stage"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage Number</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = field.value ?? 1;
                        if (current > 1) {
                          field.onChange(current - 1);
                        }
                      }}
                      disabled={!field.value || field.value <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </InputGroupButton>
                    <InputGroupInput
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Enter stage number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          field.onChange(undefined);
                          return;
                        }
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue > 0) {
                          field.onChange(numValue);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "" || parseInt(value, 10) < 1) {
                          field.onChange(1);
                        }
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).select();
                      }}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"].includes(e.key) &&
                          !(e.ctrlKey || e.metaKey)
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <InputGroupButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = field.value ?? 1;
                        field.onChange(current + 1);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </InputGroupButton>
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enemyIds"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Enemies</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEnemyDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Enemy
                  </Button>
                </div>
                <Popover 
                  open={enemySelectOpen} 
                  onOpenChange={(open) => {
                    setEnemySelectOpen(open);
                    if (!open) {
                      setEnemySearchQuery("");
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {selectedEnemies.length > 0
                          ? `${selectedEnemies.length} enemy${selectedEnemies.length === 1 ? "" : "ies"} selected`
                          : "Select enemies..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] pointer-events-auto" 
                    align="start"
                    onEscapeKeyDown={() => {
                      setEnemySelectOpen(false);
                    }}
                    onInteractOutside={(e) => {
                      // Don't close when clicking inside the popover itself
                      const target = e.target as HTMLElement;
                      if (target.closest('[data-radix-popover-content]')) {
                        e.preventDefault();
                        return;
                      }
                      // Allow closing when clicking outside (including inside the dialog)
                      // This allows clicking elsewhere in the dialog to close the popover
                    }}
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search enemies..."
                        value={enemySearchQuery}
                        onValueChange={setEnemySearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="py-4 text-center">
                            <p className="text-sm text-muted-foreground mb-2">No enemies found.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEnemySelectOpen(false);
                                setEnemyDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create New Enemy
                            </Button>
                          </div>
                        </CommandEmpty>
                        {eliteEnemies.length > 0 && (
                          <CommandGroup heading="Elite Enemies">
                            {eliteEnemies.map((enemy) => {
                              const isSelected = field.value?.includes(enemy._id as string);
                              const enemyIdString = enemy._id as string;
                              return (
                                <CommandItem
                                  key={enemy._id}
                                  value={enemy.name}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    const updated = isSelected
                                      ? current.filter((id) => id !== enemyIdString)
                                      : [...current, enemyIdString];
                                    field.onChange(updated);
                                  }}
                                  className="flex items-start gap-2"
                                >
                                  <div
                                    className={cn(
                                      "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}
                                  >
                                    <Check className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{enemy.name}</span>
                                      <Badge variant="outline" className="text-xs">Elite</Badge>
                                    </div>
                                    {(enemy.weaknesses.length > 0 || enemy.resistances.length > 0) && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {enemy.weaknesses.slice(0, 2).map((weakness, idx) => (
                                          <TypeBadge
                                            key={idx}
                                            type={weakness.type}
                                            multiplier={weakness.multiplier}
                                            variant="weakness"
                                            className="text-xs"
                                          />
                                        ))}
                                        {enemy.resistances.slice(0, 2).map((resistance, idx) => (
                                          <TypeBadge
                                            key={idx}
                                            type={resistance}
                                            variant="resistance"
                                            className="text-xs"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                        {normalEnemies.length > 0 && (
                          <CommandGroup heading="Normal Enemies">
                            {normalEnemies.map((enemy) => {
                              const isSelected = field.value?.includes(enemy._id as string);
                              const enemyIdString = enemy._id as string;
                              return (
                                <CommandItem
                                  key={enemy._id}
                                  value={enemy.name}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    const updated = isSelected
                                      ? current.filter((id) => id !== enemyIdString)
                                      : [...current, enemyIdString];
                                    field.onChange(updated);
                                  }}
                                  className="flex items-start gap-2"
                                >
                                  <div
                                    className={cn(
                                      "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}
                                  >
                                    <Check className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium">{enemy.name}</span>
                                    {(enemy.weaknesses.length > 0 || enemy.resistances.length > 0) && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {enemy.weaknesses.slice(0, 2).map((weakness, idx) => (
                                          <TypeBadge
                                            key={idx}
                                            type={weakness.type}
                                            multiplier={weakness.multiplier}
                                            variant="weakness"
                                            className="text-xs"
                                          />
                                        ))}
                                        {enemy.resistances.slice(0, 2).map((resistance, idx) => (
                                          <TypeBadge
                                            key={idx}
                                            type={resistance}
                                            variant="resistance"
                                            className="text-xs"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedEnemies.map((enemy) => (
                    <Badge
                      key={enemy._id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {enemy.name}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = field.value?.filter((id) => id !== enemy._id) || [];
                          field.onChange(updated);
                        }}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{stageId ? "Update" : "Create"}</Button>
        </DialogFooter>
      </form>

      {/* Nested Dialog for Creating Enemy */}
      <Dialog open={enemyDialogOpen} onOpenChange={setEnemyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EnemyForm
            onSuccess={(createdEnemyId) => {
              if (createdEnemyId) {
                // Automatically add the newly created enemy to the selected enemies
                handleEnemyCreated(createdEnemyId);
              } else {
                // Just close the dialog if editing
                setEnemyDialogOpen(false);
              }
            }}
            onCancel={() => setEnemyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Form>
  );
}

