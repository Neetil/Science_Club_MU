import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getUpdates, saveUpdates, Update } from "@/lib/data";

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
    const updates = await getUpdates();
    
    const newUpdate: Update = {
      id: Date.now().toString(),
      date: body.date,
      title: body.title,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      published: body.published ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updates.push(newUpdate);
    await saveUpdates(updates);

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
    const updates = await getUpdates();
    
    const index = updates.findIndex((u) => u.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    updates[index] = {
      ...updates[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await saveUpdates(updates);
    return NextResponse.json(updates[index]);
  } catch (error) {
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

    const updates = await getUpdates();
    const filtered = updates.filter((u) => u.id !== id);
    await saveUpdates(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

