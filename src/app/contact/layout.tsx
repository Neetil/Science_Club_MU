import { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = getPageMetadata(
  "Contact Us | Physics & Astronomy Club",
  "Get in touch with the Physics & Astronomy Club. Ask questions, collaborate, or learn more about joining us.",
  "/contact"
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

