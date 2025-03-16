import { useQuery, useMutation } from "convex/react";
import { Plus, Search, ChevronLeft } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Page = 'categories' | 'exercises';

export function AddExerciseDialog() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState<Page>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Queries
  const categories = useQuery(api.systemExerciseCategories.list);
  const searchResults = useQuery(api.systemExercises.search, { name: searchText });
  const categoryExercises = useQuery(
    api.systemExercises.getByCategory,
    selectedCategory ? { categoryId: selectedCategory as Id<"systemExerciseCategories"> } : "skip"
  );

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage('exercises');
  };

  // Handle back button
  const handleBack = () => {
    setCurrentPage('categories');
    setSelectedCategory(null);
  };

  if (categories === undefined || searchResults === undefined) {
    return <div>Loading...</div>;
  }

  const Content = () => (
    <div className="p-2">
      <div className="search flex items-center p-4 gap-4 w-full bg-secondary border">
        {currentPage === 'exercises' && (
          <Button variant="ghost" onClick={handleBack} className="p-1">
            <ChevronLeft size={20} />
          </Button>
        )}
        <Search size={24} />
        <Input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search exercises..."
          className="border-0 border-b-2 border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-secondary"
        />
      </div>

      <div className="search-results bg-secondary/30 max-h-[60vh] overflow-y-auto">
        {searchText ? (
          <ul>
            {searchResults?.map((exercise) => (
              <li key={exercise._id} className="border-b p-4">
                <span>{exercise.name}</span>
              </li>
            ))}
            {searchResults?.length === 0 && (
              <li className="p-4 text-center text-muted-foreground">No results found</li>
            )}
          </ul>
        ) : currentPage === 'categories' ? (
          <ul>
            {categories?.map((category) => (
              <li
                key={category._id}
                className="border-b p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleCategorySelect(category._id)}
              >
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {categoryExercises?.map((exercise) => (
              <li key={exercise._id} className="border-b p-4">
                <span>{exercise.name}</span>
              </li>
            ))}
            {categoryExercises?.length === 0 && (
              <li className="p-4 text-center text-muted-foreground">No exercises in this category</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="[&_svg]:size-7">
            <Plus />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="[&_svg]:size-7">
          <Plus />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <Content />
      </DrawerContent>
    </Drawer>
  );
}
