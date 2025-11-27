"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import EnemyForm from "@/app/dashboard/gd/components/enemy-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

import { TypeBadge } from "../../components/type-badge";

export default function EnemyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const enemyId = params.enemyId as string;
  const enemy = useQuery(api.gdEnemies.get, { enemyId: enemyId as Id<"gdEnemies"> });
  const deleteEnemy = useMutation(api.gdEnemies.remove);
  const stages = useQuery(api.gdStages.list) ?? [];

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this enemy?")) {
      try {
        await deleteEnemy({ enemyId: enemyId as Id<"gdEnemies"> });
        toast({
          title: "Enemy deleted",
          duration: 2000,
        });
        router.push("/dashboard/gd");
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete enemy",
          variant: "destructive",
        });
      }
    }
  };

  if (enemy === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (enemy === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Enemy not found</p>
          <Link href="/dashboard/gd">
            <Button variant="outline">Back to Stages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const enemyStages = stages.filter((stage) =>
    enemy.stageIds?.includes(stage._id) ?? false
  );

  const EnemyFormContent = (
    <EnemyForm
      enemyId={enemyId as Id<"gdEnemies">}
      onSuccess={() => {
        setEditDialogOpen(false);
      }}
      onCancel={() => setEditDialogOpen(false)}
    />
  );

  return (
    <div className="flex h-full flex-col space-y-4 px-4 py-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/gd">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-lg md:text-2xl font-semibold">{enemy.name}</h2>
          {enemy.elite && (
            <Badge variant="outline" className="mt-1">
              Elite
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {enemy.image && (
          <Card>
            <CardContent className="p-4">
              <Image
                src={enemy.image}
                alt={enemy.name}
                className="w-full max-w-md mx-auto rounded-lg object-cover"
                width={100}
                height={100}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            {enemy.weaknesses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {enemy.weaknesses.map((weakness, idx) => (
                  <TypeBadge
                    key={idx}
                    type={weakness.type}
                    multiplier={weakness.multiplier}
                    variant="weakness"
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No weaknesses</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resistances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {enemy.resistances.map((resistance, idx) => (
                <TypeBadge
                  key={idx}
                  type={resistance}
                  variant="resistance"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{enemy.feature}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{enemy.info}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stages ({enemyStages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {enemyStages.length > 0 ? (
              <div className="space-y-2">
                {enemyStages.map((stage) => (
                  <Link
                    key={stage._id}
                    href={`/dashboard/gd`}
                    className="block p-2 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Stage {stage.number}
                      </span>
                      <Badge variant={stage.difficulty === "elite" ? "default" : "secondary"}>
                        {stage.difficulty}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stages assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {isMobile ? (
        <Drawer open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DrawerContent>
            <div className="p-4">
              {EnemyFormContent}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {EnemyFormContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

