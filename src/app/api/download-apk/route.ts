import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const apkUrl = process.env.NEXT_PUBLIC_APK_URL;
  
  if (apkUrl) {
    // Redirect to external APK URL
    return NextResponse.redirect(apkUrl, { status: 302 });
  }
  
  // Serve local APK file from public/downloads/maSoKo.apk
  try {
    const filePath = join(process.cwd(), "public", "downloads", "maSoKo.apk");
    const file = await readFile(filePath);
    
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": "attachment; filename=maSoKo.apk",
      },
    });
  } catch {
    // APK file not found - redirect to config with instructions
    return NextResponse.redirect(
      "https://masoko-lemon.vercel.app/downloads/config.json",
      { status: 302 }
    );
  }
}