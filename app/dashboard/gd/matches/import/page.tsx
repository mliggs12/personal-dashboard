"use client";

import { useAction, useMutation } from "convex/react";
import { Check, Loader2, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

/**
 * Parse Galaxy Defense end-game screenshots.
 *
 * All screenshots selected in one submission are treated as the same
 * match — useful when the turret table scrolls off-screen and you
 * need two or three shots to capture everything.
 */

const ACCEPTED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

function filenameTimestamp(name: string): number | null {
  const patterns = [
    /(\d{4})\.(\d{2})\.(\d{2})[_-](\d{2})\.(\d{2})\.(\d{2})/,
    /(\d{4})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/,
    /(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/,
  ];
  for (const pat of patterns) {
    const m = name.match(pat);
    if (m) {
      const [, y, mo, d, h, mi, s] = m;
      const t = new Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        Number(s),
      ).getTime();
      if (Number.isFinite(t)) return t;
    }
  }
  return null;
}

export default function ImportMatchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const generateUploadUrl = useMutation(
    api.gdMatchesUpload.generateUploadUrl,
  );
  const parseScreenshots = useAction(api.gdMatchesParse.parseScreenshots);

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const array = Array.from(incoming).filter((f) =>
      ACCEPTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    setFiles((prev) => {
      const existing = new Set(prev.map((p) => p.name + p.size));
      return [
        ...prev,
        ...array.filter((f) => !existing.has(f.name + f.size)),
      ];
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setIsSubmitting(true);
    try {
      const storageIds: Id<"_storage">[] = [];
      // Sort by filename timestamp (or original order as fallback) so
      // the first image is the earliest — stitching reads them in
      // order.
      const ordered = [...files].sort((a, b) => {
        const ta = filenameTimestamp(a.name);
        const tb = filenameTimestamp(b.name);
        if (ta != null && tb != null) return ta - tb;
        return a.name.localeCompare(b.name);
      });
      for (const file of ordered) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });
        if (!res.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        const { storageId } = (await res.json()) as {
          storageId: Id<"_storage">;
        };
        storageIds.push(storageId);
      }

      const playedAt =
        filenameTimestamp(ordered[0].name) ?? Date.now();
      const result = await parseScreenshots({
        screenshotStorageIds: storageIds,
        playedAt,
      });

      toast({
        title: result.merged ? "Appended to existing match" : "Match saved",
        description: `${files.length} screenshot${files.length > 1 ? "s" : ""} parsed`,
        duration: 3000,
      });
      router.push("/dashboard/gd/matches");
    } catch (error) {
      console.error(error);
      toast({
        title: "Parse failed",
        description:
          error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-2xl font-semibold">
            Import match
          </h2>
          <p className="text-sm text-muted-foreground">
            Drop one or more end-game screenshots — parsed with an LLM
            vision model
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/gd/matches">Back to matches</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screenshots</CardTitle>
          <CardDescription>
            If the turret list scrolled off-screen, select all screenshots
            of the same match together. They&apos;ll be stitched and
            deduped automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label
            htmlFor="screenshot-input"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 hover:border-muted-foreground/40"
            }`}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm">
              Drag screenshots here or{" "}
              <span className="underline">choose files</span>
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, or WEBP
            </span>
            <input
              id="screenshot-input"
              type="file"
              multiple
              accept={ACCEPTED_EXTS.join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
              disabled={isSubmitting}
            />
          </label>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, idx) => (
                <li
                  key={file.name + idx}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="truncate max-w-[360px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isSubmitting}
                    onClick={() =>
                      setFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <Button
              disabled={files.length === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing…
                </>
              ) : (
                <>Parse {files.length || ""} screenshot
                  {files.length === 1 ? "" : "s"}</>
              )}
            </Button>
            {files.length > 0 && !isSubmitting && (
              <Button variant="ghost" onClick={() => setFiles([])}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
