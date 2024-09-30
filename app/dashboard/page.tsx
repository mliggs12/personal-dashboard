import { formatTimestamp } from "@/lib/utils";
import WeatherWidget from "./components/weather-widget";
import NotesWidget from "./components/notes-widget";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRef, useState } from "react";

export default function DashboardPage() {
  // const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  // const sendImage = useMutation(api.files.sendImage);

  // const imageInput = useRef<HTMLInputElement>(null);
  // const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // function handleSendImage(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault();

  //   // Get a short-lived upload URL
  //   generateUploadUrl().then((postUrl) => {
  //     // POST the file to the URL
  //     fetch(postUrl, {
  //       method: "POST",
  //       headers: { "Content-Type": selectedImage!.type },
  //       body: selectedImage,
  //     });
  //   });
  //   // Save the newly allocated storage ID to the database
  //   sendImage(storageId);

  //   setSelectedImage(null);
  //   imageInput.current!.value = "";
  // }

  return (
    <div className="container pt-8 pb-8 px-4 sm:px-8">
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl 2xl:text-7xl font-bold tracking-tight">
              Dashboard
            </h2>
            <div className="flex items-center justify-center">
              <p className="text-lg">{formatTimestamp(Date.now())}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <NotesWidget />
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
