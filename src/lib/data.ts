import { promises as fs } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic data file operations
async function readDataFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);
  
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    // File doesn't exist, return default and create it
    await writeDataFile(filename, defaultValue);
    return defaultValue;
  }
}

async function writeDataFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Events
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getEvents(): Promise<Event[]> {
  return readDataFile<Event[]>("events.json", []);
}

export async function saveEvents(events: Event[]): Promise<void> {
  await writeDataFile("events.json", events);
}

// Gallery Images
export interface GalleryImage {
  id: string;
  src: string;
  category: string;
  title: string;
  description?: string;
  createdAt: string;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return readDataFile<GalleryImage[]>("gallery.json", []);
}

export async function saveGalleryImages(images: GalleryImage[]): Promise<void> {
  await writeDataFile("gallery.json", images);
}

// Team Members
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  category: "executive" | "coordinator" | "mentor";
  image?: string;
  order: number;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return readDataFile<TeamMember[]>("team.json", []);
}

export async function saveTeamMembers(members: TeamMember[]): Promise<void> {
  await writeDataFile("team.json", members);
}

// Updates/News
export interface Update {
  id: string;
  date: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getUpdates(): Promise<Update[]> {
  return readDataFile<Update[]>("updates.json", []);
}

export async function saveUpdates(updates: Update[]): Promise<void> {
  await writeDataFile("updates.json", updates);
}

// Statistics
export interface Statistics {
  eventsConducted: number;
  activeMembers: number;
  outreachTrips: number;
  updatedAt: string;
}

export async function getStatistics(): Promise<Statistics> {
  return readDataFile<Statistics>("statistics.json", {
    eventsConducted: 10,
    activeMembers: 60,
    outreachTrips: 5,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveStatistics(stats: Statistics): Promise<void> {
  await writeDataFile("statistics.json", stats);
}

// Contact Submissions
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  read: boolean;
  createdAt: string;
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  return readDataFile<ContactSubmission[]>("contact-submissions.json", []);
}

export async function saveContactSubmissions(submissions: ContactSubmission[]): Promise<void> {
  await writeDataFile("contact-submissions.json", submissions);
}

