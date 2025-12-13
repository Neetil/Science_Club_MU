import { PrismaClient } from "@prisma/client";
import type { ContactSubmission, Event, GalleryImage, HeroGallery, Statistics, TeamMember, Update } from "@prisma/client";

export type { ContactSubmission, Event, GalleryImage, HeroGallery, Statistics, TeamMember, Update } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Events
export async function getEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createEvent(data: Omit<Event, "id" | "createdAt" | "updatedAt">) {
  return prisma.event.create({ data });
}

export async function updateEvent(id: string, data: Partial<Omit<Event, "id" | "createdAt">>) {
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({ where: { id } });
}

// Gallery Images
export async function getGalleryImages(): Promise<GalleryImage[]> {
  return prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createGalleryImage(data: Omit<GalleryImage, "id" | "createdAt">) {
  return prisma.galleryImage.create({ data });
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImage>) {
  return prisma.galleryImage.update({ where: { id }, data });
}

export async function deleteGalleryImage(id: string) {
  return prisma.galleryImage.delete({ where: { id } });
}

// Team Members
export async function getTeamMembers(): Promise<TeamMember[]> {
  return prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }],
  });
}

export async function createTeamMember(data: Omit<TeamMember, "id">) {
  return prisma.teamMember.create({ data });
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  return prisma.teamMember.update({ where: { id }, data });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({ where: { id } });
}

// Updates/News
export async function getUpdates(): Promise<Update[]> {
  return prisma.update.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUpdate(data: Omit<Update, "id" | "createdAt" | "updatedAt">) {
  return prisma.update.create({ data });
}

export async function updateUpdate(id: string, data: Partial<Omit<Update, "id" | "createdAt">>) {
  return prisma.update.update({ where: { id }, data });
}

export async function deleteUpdate(id: string) {
  return prisma.update.delete({ where: { id } });
}

// Statistics (single row)
const DEFAULT_STATS = {
  eventsConducted: 10,
  activeMembers: 60,
  outreachTrips: 5,
  updatedAt: new Date(),
};

export async function getStatistics(): Promise<Statistics> {
  const existing = await prisma.statistics.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.statistics.create({
    data: {
      id: 1,
      ...DEFAULT_STATS,
    },
  });
}

export async function saveStatistics(stats: Omit<Statistics, "id">): Promise<Statistics> {
  return prisma.statistics.upsert({
    where: { id: 1 },
    update: { ...stats, updatedAt: new Date() },
    create: { id: 1, ...stats, updatedAt: new Date() },
  });
}

// Contact Submissions
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  return prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateContactSubmission(id: string, data: Partial<ContactSubmission>) {
  return prisma.contactSubmission.update({ where: { id }, data });
}

export async function deleteContactSubmission(id: string) {
  return prisma.contactSubmission.delete({ where: { id } });
}

// Hero Gallery Images
export async function getHeroGalleryImages(): Promise<HeroGallery[]> {
  return prisma.heroGallery.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export async function createHeroGalleryImage(data: Omit<HeroGallery, "id" | "createdAt" | "updatedAt">) {
  return prisma.heroGallery.create({ data });
}

export async function updateHeroGalleryImage(id: string, data: Partial<Omit<HeroGallery, "id" | "createdAt" | "updatedAt">>) {
  return prisma.heroGallery.update({ where: { id }, data });
}

export async function deleteHeroGalleryImage(id: string) {
  return prisma.heroGallery.delete({ where: { id } });
}

