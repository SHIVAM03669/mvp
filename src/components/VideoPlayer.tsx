"use client";

import React, { useEffect, useRef } from "react";
import { Video as VideoType } from "@/lib/types";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
    video: VideoType;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasTrackedView = useRef(false);

    useEffect(() => {
        // Track view once on mount
        if (!hasTrackedView.current) {
            fetch("/api/track", {
                method: "POST",
                body: JSON.stringify({ id: video.id, type: "view" }),
            }).catch(err => console.error(err));
            hasTrackedView.current = true;
        }
    }, [video.id]);

    const handleEnded = () => {
        fetch("/api/track", {
            method: "POST",
            body: JSON.stringify({ id: video.id, type: "completion", value: 100 }),
        }).catch(err => console.error(err));
    };

    // Optional: Track partial completion on unload?
    // Can get complex with beacon API. Stick to "Completed" event for now or simple view count.

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <video
                    ref={videoRef}
                    src={`/uploads/${video.filename}`}
                    controls
                    autoPlay
                    className={styles.video}
                    onEnded={handleEnded}
                />
            </div>
            <div className={styles.meta}>
                <h1 className={styles.title}>Recording {new Date(video.createdAt).toLocaleString()}</h1>
                <div className={styles.stats}>
                    <span>{video.views + 1} Views</span> {/* Optimistic update */}
                    {video.completionRate > 0 && (
                        <span>~{Math.round(video.completionRate)}% Completion Rate</span>
                    )}
                </div>
            </div>
        </div>
    );
}
