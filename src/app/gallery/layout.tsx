import { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = getPageMetadata(
  "Gallery | Physics & Astronomy Club",
  "Browse photos from Physics & Astronomy Club events, observations, workshops, and team activities.",
  "/gallery"
);

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

