import { NextResponse } from "next/server";
import { getResumes } from "@/lib/storage";

export async function GET() {
  const resumes = await getResumes();
  return NextResponse.json(
    resumes.map((r) => ({
      id: r.id,
      fullName: r.intakeData.fullName,
      email: r.intakeData.email,
      selectedService: r.intakeData.selectedService,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      adminNotes: r.adminNotes,
    })),
  );
}
