"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { tagColors } from "../tasks/data/data";
import { TagBadge } from "../components/tasks/tag-badge";

export function TagsContent() {
  const tagsWithCounts = useQuery(api.tags.listWithCounts);
  const createTag = useMutation(api.tags.create);
  const updateTag = useMutation(api.tags.update);
  const removeTag = useMutation(api.tags.remove);
  const { toast } = useToast();

  // Create form state
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(tagColors[0].value);

  // Edit state
  const [editingId, setEditingId] = useState<Id<"tags"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  // Delete confirmation state
  const [deleteTag, setDeleteTag] = useState<{
    id: Id<"tags">;
    name: string;
    taskCount: number;
  } | null>(null);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;

    try {
      await createTag({ name: newTagName.trim(), color: selectedColor });
      setNewTagName("");
      toast({ title: "Tag created", duration: 2000 });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create tag",
        variant: "destructive",
      });
    }
  };

  const startEditing = (tag: {
    _id: Id<"tags">;
    name: string;
    color: string;
  }) => {
    setEditingId(tag._id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await updateTag({
        tagId: editingId,
        name: editName.trim(),
        color: editColor,
      });
      cancelEditing();
      toast({ title: "Tag updated", duration: 2000 });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update tag",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTag) return;

    try {
      await removeTag({ tagId: deleteTag.id });
      setDeleteTag(null);
      toast({ title: "Tag deleted", duration: 2000 });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create new tag section */}
      <div className="space-y-3 p-4 border rounded-lg bg-card">
        <h2 className="text-sm font-medium text-muted-foreground">
          Create New Tag
        </h2>
        <div className="flex gap-2">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1"
          />
          <Button onClick={handleCreate} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Color palette */}
        <div className="flex flex-wrap gap-2">
          {tagColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                selectedColor === color.value
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.value)}
              title={color.name}
            />
          ))}
        </div>

        {/* Preview */}
        {newTagName && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Preview:</span>
            <TagBadge name={newTagName} color={selectedColor} />
          </div>
        )}
      </div>

      {/* Tags list */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your Tags ({tagsWithCounts?.length || 0})
        </h2>

        {tagsWithCounts?.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No tags yet. Create one above to get started.
          </p>
        )}

        <div className="space-y-1">
          {tagsWithCounts?.map((tag) => (
            <div
              key={tag._id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {editingId === tag._id ? (
                // Edit mode
                <div className="flex-1 space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEditing();
                    }}
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {tagColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all",
                          editColor === color.value
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setEditColor(color.value)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-center gap-3">
                    <TagBadge name={tag.name} color={tag.color} />
                    <Badge variant="secondary" className="text-xs">
                      {tag.taskCount} {tag.taskCount === 1 ? "task" : "tasks"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setDeleteTag({
                          id: tag._id,
                          name: tag.name,
                          taskCount: tag.taskCount,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTag} onOpenChange={() => setDeleteTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag &ldquo;{deleteTag?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTag?.taskCount && deleteTag.taskCount > 0 ? (
                <>
                  This tag is used by{" "}
                  <strong>
                    {deleteTag.taskCount}{" "}
                    {deleteTag.taskCount === 1 ? "task" : "tasks"}
                  </strong>
                  . The tag will be removed from all tasks. This action cannot
                  be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
