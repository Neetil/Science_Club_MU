import { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = getPageMetadata(
  "Events | Physics & Astronomy Club",
  "View upcoming and past events organized by the Physics & Astronomy Club. Join workshops, lectures, and astronomy nights.",
  "/events"
);

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

