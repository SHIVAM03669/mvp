import { NextRequest, NextResponse } from "next/server";
import { incrementViews, updateCompletion } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, type, value } = body;

        if (!id || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (type === "view") {
            await incrementViews(id);
        } else if (type === "completion") {
            if (typeof value !== 'number') {
                return NextResponse.json({ error: "Value required for completion" }, { status: 400 });
            }
            await updateCompletion(id, value);
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Tracking Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
