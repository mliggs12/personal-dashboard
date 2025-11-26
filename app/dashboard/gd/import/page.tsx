"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { FileDown, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

export default function ImportPage() {
  const { toast } = useToast();
  const importEnemies = useMutation(api.gdImport.importEnemies);
  const [isImporting, setIsImporting] = useState(false);

  const processCSV = async (csvText: string) => {
    const enemies = parseCSV(csvText);
    const result = await importEnemies({ enemies });
    toast({
      title: "Import successful",
      description: `Imported ${result.imported} enemies`,
      duration: 3000,
    });
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    // Find the index of "Elite Spikeshell Beetle" to determine elite cutoff
    let eliteCutoffIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Parse first field (name) handling quotes
      let name = "";
      let inQuotes = false;
      let j = 0;
      while (j < line.length) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          break;
        } else {
          name += char;
        }
        j++;
      }
      name = name.trim();
      if (name === "Elite Spikeshell Beetle") {
        eliteCutoffIndex = i;
        break;
      }
    }

    const enemies = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Handle quoted fields with commas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            current += '"';
            j++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // Ensure we have at least 9 columns (pad with empty strings if needed)
      while (values.length < 9) {
        values.push("");
      }

      const name = values[0];
      if (!name || name.trim() === "") continue;

      // Determine if enemy is elite based on position (before or including "Elite Spikeshell Beetle")
      // All enemies up to and including "Elite Spikeshell Beetle" are elite
      const isElite = eliteCutoffIndex > 0 ? i <= eliteCutoffIndex : false;

      enemies.push({
        name: name.trim(),
        weakness50_1: values[1]?.trim() || undefined,
        weakness50_2: values[2]?.trim() || undefined,
        weakness100: values[3]?.trim() || undefined,
        resistance50_1: values[4]?.trim() || undefined,
        resistance50_2: values[5]?.trim() || undefined,
        normalStages: values[7]?.trim() || undefined,
        eliteStages: values[8]?.trim() || undefined,
        isElite,
      });
    }

    return enemies;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      await processCSV(text);
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import enemies",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleLoadDefaultCSV = async () => {
    setIsImporting(true);
    try {
      const response = await fetch("/api/gd-import-csv");
      if (!response.ok) {
        throw new Error("Failed to load default CSV file");
      }
      const csvText = await response.text();
      await processCSV(csvText);
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to load default CSV",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4 px-4 py-4">
      <div>
        <h2 className="text-lg md:text-2xl font-semibold">Import Enemies</h2>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file to import enemy data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>
            Upload a CSV file with enemy data. Expected format: Enemy,50% MORE,50% MORE,100% MORE,50% LESS,50% LESS,Extra,Normal,Elite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              onClick={handleLoadDefaultCSV}
              disabled={isImporting}
              className="w-full"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Load Default CSV"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <label htmlFor="csv-upload" className="cursor-pointer">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                className="w-full"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose CSV File
                </span>
              </Button>
            </label>
            {isImporting && (
              <p className="text-sm text-muted-foreground text-center">
                Processing import...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

