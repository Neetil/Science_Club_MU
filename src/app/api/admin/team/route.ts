import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getTeamMembers, saveTeamMembers, TeamMember } from "@/lib/data";

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
    const members = await getTeamMembers();
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: body.name,
      role: body.role,
      focus: body.focus,
      category: body.category,
      image: body.image,
      order: body.order ?? members.length,
    };

    members.push(newMember);
    await saveTeamMembers(members);

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
    const members = await getTeamMembers();
    
    const index = members.findIndex((m) => m.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    members[index] = { ...members[index], ...body };
    await saveTeamMembers(members);

    return NextResponse.json(members[index]);
  } catch (error) {
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

    const members = await getTeamMembers();
    const filtered = members.filter((m) => m.id !== id);
    await saveTeamMembers(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}

