export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.organizationId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const orgId = (session!.user as any).organizationId as string;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = `${orgId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("concordia-proofs")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from("concordia-proofs")
      .getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "UPLOAD_ERROR" },
      { status: 500 }
    );
  }
}