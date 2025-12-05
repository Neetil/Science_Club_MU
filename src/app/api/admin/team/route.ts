import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMembers,
  prisma,
  updateTeamMember,
} from "@/lib/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await getTeamMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const lastMember = await prisma.teamMember.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastMember?.order ?? -1) + 1;

    const newMember = await createTeamMember({
      name: body.name,
      role: body.role,
      focus: body.focus,
      category: body.category,
      image: body.image,
      order: body.order ?? nextOrder,
    });

    return NextResponse.json(newMember);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateTeamMember(body.id, {
      name: body.name,
      role: body.role,
      focus: body.focus,
      category: body.category,
      image: body.image,
      order: body.order,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
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
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    await deleteTeamMember(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}

