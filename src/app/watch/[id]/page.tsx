import { notFound } from "next/navigation";
import { getVideo } from "@/lib/db";
import VideoPlayer from "@/components/VideoPlayer";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: PageProps) {
    const { id } = await params;
    const video = await getVideo(id);

    if (!video) {
        notFound();
    }

    return (
        <div className="container" style={{ padding: "4rem 0", maxWidth: "1000px" }}>
            <VideoPlayer video={video} />
        </div>
    );
}
