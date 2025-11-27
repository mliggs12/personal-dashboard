"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { FieldValues, useForm, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { ResistanceInput } from "./resistance-input";
import WeaknessInput from "./weakness-input";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  weaknesses: z
    .array(
      z.object({
        type: z.string().min(1),
        multiplier: z.union([z.literal(0.5), z.literal(1.0)]),
      })
    )
    .max(2, "Maximum 2 weaknesses allowed")
    .optional()
    .default([]),
  resistances: z
    .array(z.string().min(1))
    .max(2, "Maximum 2 resistances allowed")
    .optional()
    .default([]),
  elite: z.boolean().optional().default(false),
  feature: z.string().optional().default(""),
  info: z.string().optional().default(""),
  image: z.string().optional(),
  stageIds: z.array(z.string()).optional(),
});

interface EnemyFormProps {
  enemyId?: Id<"gdEnemies">;
  onSuccess?: (createdEnemyId?: Id<"gdEnemies">) => void;
  onCancel?: () => void;
}

export default function EnemyForm({ enemyId, onSuccess, onCancel }: EnemyFormProps) {
  const { toast } = useToast();
  const createEnemy = useMutation(api.gdEnemies.create);
  const updateEnemy = useMutation(api.gdEnemies.update);
  const getEnemy = useQuery(
    api.gdEnemies.get,
    enemyId ? { enemyId: enemyId as Id<"gdEnemies"> } : "skip"
  );
  const enemiesQuery = useQuery(api.gdEnemies.list);
  const stagesQuery = useQuery(api.gdStages.list);

  const [stageSelectOpen, setStageSelectOpen] = useState(false);
  const [openWeaknessIndex, setOpenWeaknessIndex] = useState<number | null>(null);
  const [openResistanceIndex, setOpenResistanceIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      weaknesses: [],
      resistances: [],
      elite: false,
      feature: "",
      info: "",
      image: "",
      stageIds: undefined,
    },
  });

  // Load enemy data if editing
  useEffect(() => {
    if (getEnemy) {
      form.reset({
        name: getEnemy.name,
        weaknesses: getEnemy.weaknesses,
        resistances: getEnemy.resistances,
        elite: getEnemy.elite,
        feature: getEnemy.feature,
        info: getEnemy.info,
        image: getEnemy.image || "",
        stageIds: getEnemy.stageIds.length > 0 ? getEnemy.stageIds.map((id) => id as string) : undefined,
      });
    }
  }, [getEnemy, form]);

  const selectedStageIds = useWatch({
    control: form.control,
    name: "stageIds",
    defaultValue: [],
  }) ?? [];
  const stages = stagesQuery ?? [];
  const selectedStages = stages.filter((s) =>
    selectedStageIds.includes(s._id as string)
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const enemies = enemiesQuery ?? [];
      // Check for duplicate enemy name (case-insensitive)
      const duplicateEnemy = enemies.find(
        (e) =>
          e.name.toLowerCase() === values.name.toLowerCase().trim() &&
          (enemyId ? e._id !== enemyId : true)
      );

      if (duplicateEnemy) {
        toast({
          title: "Duplicate enemy",
          description: `An enemy named "${values.name}" already exists`,
          variant: "destructive",
        });
        return;
      }

      const stageIds = (values.stageIds || []).map((id) => id as Id<"gdStages">);

      if (enemyId) {
        await updateEnemy({
          enemyId,
          name: values.name,
          weaknesses: values.weaknesses || [],
          resistances: values.resistances || [],
          elite: values.elite ?? false,
          feature: values.feature || "",
          info: values.info || "",
          image: values.image || undefined,
          stageIds,
        });
        toast({
          title: "Enemy updated",
          duration: 2000,
        });
      } else {
        const newEnemyId = await createEnemy({
          name: values.name,
          weaknesses: values.weaknesses || [],
          resistances: values.resistances || [],
          elite: values.elite ?? false,
          feature: values.feature || "",
          info: values.info || "",
          image: values.image || undefined,
          stageIds,
        });
        toast({
          title: "Enemy created",
          duration: 2000,
        });
        form.reset();
        onSuccess?.(newEnemyId);
        return;
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save enemy",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>{enemyId ? "Edit Enemy" : "Create Enemy"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enemy name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weaknesses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weaknesses (0-2, optional)</FormLabel>
                <div className="space-y-2">
                  {field.value.map((_, index) => (
                    <WeaknessInput
                      key={index}
                      form={form as unknown as UseFormReturn<FieldValues>}
                      weaknesses={field.value}
                      open={openWeaknessIndex === index}
                      onOpenChange={(isOpen: boolean) => {
                        setOpenWeaknessIndex(isOpen ? index : null);
                      }}
                      index={index}
                      onRemove={() => {
                        const updated = field.value.filter((_, i) => i !== index);
                        field.onChange(updated);
                      }}
                    />
                  ))}
                  {field.value.length < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIndex = field.value.length;
                        field.onChange([
                          ...field.value,
                          { type: "", multiplier: 0.5 },
                        ]);
                        // Open the dropdown for the newly added weakness
                        setTimeout(() => {
                          setOpenWeaknessIndex(newIndex);
                        }, 0);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Weakness
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resistances"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resistances (0-2, optional)</FormLabel>
                <div className="space-y-2">
                  {field.value.map((_, index) => (
                    <ResistanceInput
                      key={index}
                      form={form as unknown as UseFormReturn<FieldValues>}
                      index={index}
                      resistances= {field.value as unknown as Array<{ type: string; multiplier: number }>}
                      open={openResistanceIndex === index}
                      onOpenChange={(isOpen) => {
                        setOpenResistanceIndex(isOpen ? index : null);
                      }}
                      onRemove={() => {
                        const updated = field.value.filter((_, i) => i !== index);
                        field.onChange(updated);
                        if (openResistanceIndex === index) {
                          setOpenResistanceIndex(null);
                        }
                      }}
                    />
                  ))}
                  {field.value.length < 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIndex = field.value.length;
                        field.onChange([...field.value, ""]);
                        // Open the dropdown for the newly added resistance
                        setTimeout(() => {
                          setOpenResistanceIndex(newIndex);
                        }, 0);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resistance
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="elite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Elite Enemy</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enemy feature description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Info (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Additional enemy information" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {enemyId && (
            <FormField
              control={form.control}
              name="stageIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stages</FormLabel>
                  <Popover open={stageSelectOpen} onOpenChange={setStageSelectOpen}>
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
                          {selectedStages.length > 0
                            ? `${selectedStages.length} stage${selectedStages.length === 1 ? "" : "s"} selected`
                            : "Select stages..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search stages..." />
                        <CommandList>
                          <CommandEmpty>No stages found.</CommandEmpty>
                          <CommandGroup>
                            {stages.map((stage) => {
                              const isSelected = field.value?.includes(stage._id as string);
                              return (
                                <CommandItem
                                  key={stage._id}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    const updated = isSelected
                                      ? current.filter((id) => id !== stage._id)
                                      : [...current, stage._id as string];
                                    field.onChange(updated);
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible"
                                    )}
                                  >
                                    <Check className="h-4 w-4" />
                                  </div>
                                  Stage {stage.number} ({stage.difficulty})
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStages.map((stage) => (
                      <Badge
                        key={stage._id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Stage {stage.number} ({stage.difficulty})
                        <button
                          type="button"
                          onClick={() => {
                            const updated = field.value?.filter((id) => id !== stage._id) || [];
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
          )}
        </div>
        <DialogFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{enemyId ? "Update" : "Create"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

