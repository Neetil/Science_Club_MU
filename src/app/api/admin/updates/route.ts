import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createUpdate, deleteUpdate, getUpdates, updateUpdate } from "@/lib/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates = await getUpdates();
  return NextResponse.json(updates);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newUpdate = await createUpdate({
      date: body.date,
      title: body.title,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      published: body.published ?? false,
    });

    return NextResponse.json(newUpdate);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateUpdate(body.id, {
      date: body.date,
      title: body.title,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      published: body.published,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Update ID required" }, { status: 400 });
    }

    await deleteUpdate(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

