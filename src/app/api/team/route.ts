import { NextResponse } from "next/server";
import { getTeamMembers } from "@/lib/data";

export async function GET() {
  try {
    const members = await getTeamMembers();
    // Sort by category and order
    const sorted = members.sort((a, b) => {
      if (a.category !== b.category) {
        const order = ["executive", "coordinator", "mentor"];
        return order.indexOf(a.category) - order.indexOf(b.category);
      }
      return a.order - b.order;
    });
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}



