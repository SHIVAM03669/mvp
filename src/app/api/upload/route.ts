import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { createVideo } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const id = uuidv4();
        const filename = `${id}.webm`;
        // In production (Vercel), we cannot write to public/uploads reliably.
        // For local MVP, this works.
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        // Ensure directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        await fs.writeFile(path.join(uploadDir, filename), buffer);

        await createVideo({
            id,
            createdAt: new Date().toISOString(),
            views: 0,
            completionRate: 0,
            totalWatches: 0,
            filename, // just the filename, frontend can prepend /uploads/
        });

        return NextResponse.json({ id, url: `/uploads/${filename}` });
    } catch (err) {
        console.error("Upload Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
