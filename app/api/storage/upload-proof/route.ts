export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "NO_FILE" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const filePath = `proofs/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("proofs")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("proofs")
      .getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "UPLOAD_ERROR" },
      { status: 500 }
    );
  }
}