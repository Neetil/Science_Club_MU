import { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = getPageMetadata(
  "Team | Physics & Astronomy Club",
  "Meet the mentors, executive team, and coordinators of the Physics & Astronomy Club at Medicaps University.",
  "/team"
);

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}

