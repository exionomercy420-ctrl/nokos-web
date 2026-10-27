
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase sign out error:", error.message);

    return NextResponse.redirect(
      new URL("/?error=signout_failed", request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
  new URL("/login", request.url),
  { status: 303 }
  );
}
