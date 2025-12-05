import { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = getPageMetadata(
  "About Us | Physics & Astronomy Club",
  "Learn about the Physics & Astronomy Club's mission, vision, and activities. Discover how we inspire curiosity and exploration.",
  "/about"
);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

