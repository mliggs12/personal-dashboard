import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Enthousiazein",
    short_name: "Enthousiazein",
    description:
      "A personal dashboard for managing the mundane & creative aspects of life.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#DC2626",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
