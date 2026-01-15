"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Scissors, Upload, Play, Check } from "lucide-react";
import { loadFFmpeg } from "../lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import styles from "./Editor.module.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";

interface EditorProps {
    recordedBlob: Blob;
    onBack: () => void;
}

export default function Editor({ recordedBlob, onBack }: EditorProps) {
    const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Convert blob to URL for preview
        const url = URL.createObjectURL(recordedBlob);
        setVideoUrl(url);

        // Create File object for upload/processing
        const file = new File([recordedBlob], "recording.webm", { type: "video/webm" });
        setVideoFile(file);

        // Load FFmpeg
        loadFFmpeg().then((ff) => {
            setFfmpeg(ff);
            console.log("FFmpeg loaded");
        });

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [recordedBlob]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const vidDuration = videoRef.current.duration;
            setDuration(vidDuration);
            setEndTime(vidDuration);
        }
    };

    const handleTrim = async () => {
        if (!ffmpeg || !videoFile) return;

        setIsProcessing(true);
        try {
            const inputName = "input.webm";
            const outputName = "output.webm";

            await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

            // ffmpeg -i input.webm -ss 00:00:01 -to 00:00:05 -c copy output.webm
            // Using -c copy is fast but might not be frame-perfect. 
            // Re-encoding ensures accuracy but is slower. 
            // Let's try copy first for speed, if it fails or is inaccurate, we can switch.
            // Actually -ss before -i is faster seeking.

            const args = [
                "-i", inputName,
                "-ss", startTime.toString(),
                "-to", endTime.toString(),
                "-c", "copy",
                outputName
            ];

            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(outputName);
            const newBlob = new Blob([new Uint8Array(data as any)], { type: "video/webm" });
            const newUrl = URL.createObjectURL(newBlob);

            setVideoUrl(newUrl);
            setVideoFile(new File([newBlob], "trimmed.webm", { type: "video/webm" }));

            // Reset timestamps based on new video? Or keep them?
            // Resetting might be less confusing as the new video becomes the source.
            if (videoRef.current) {
                videoRef.current.src = newUrl;
                // Metadata load will reset duration/sliders
            }

        } catch (error) {
            console.error("Error trimming:", error);
            alert("Failed to trim video.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpload = async () => {
        if (!videoFile) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", videoFile);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            // data should contain { id, url }
            // Construct full share URL
            const fullUrl = `${window.location.origin}/watch/${data.id}`;
            setShareUrl(fullUrl);

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload video.");
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (shareUrl) {
        return (
            <div className={styles.container}>
                <div className={styles.success}>
                    <div className={styles.checkWrapper}>
                        <Check size={48} />
                    </div>
                    <h2>Recording Ready!</h2>
                    <div className={styles.linkBox}>
                        <input readOnly value={shareUrl} />
                        <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                            Copy Link
                        </button>
                        <a href={shareUrl} className="btn btn-secondary">
                            View Page
                        </a>
                    </div>
                    <button className="btn btn-secondary" onClick={onBack}>Record Another</button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className="btn btn-secondary" onClick={onBack}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h2>Edit Recording</h2>
                <div className={styles.actions}>
                    <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading || isProcessing}>
                        {isUploading ? "Uploading..." : <><Upload size={16} /> Share Recording</>}
                    </button>
                </div>
            </header>

            <div className={styles.previewWrapper}>
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className={styles.video}
                    onLoadedMetadata={handleLoadedMetadata}
                />
            </div>

            <div className={styles.tools}>
                <div className={styles.trimmer}>
                    <div className={styles.trimLabel}>
                        <Scissors size={16} />
                        <span>Trim Video</span>
                    </div>

                    <div className={styles.sliders}>
                        <div className={styles.sliderGroup}>
                            <label>Start: {formatTime(startTime)}</label>
                            <input
                                type="range"
                                min={0}
                                max={duration}
                                step={0.1}
                                value={startTime}
                                onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 1))} // Ensure start < end
                            />
                        </div>
                        <div className={styles.sliderGroup}>
                            <label>End: {formatTime(endTime)}</label>
                            <input
                                type="range"
                                min={0}
                                max={duration}
                                step={0.1}
                                value={endTime}
                                onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 1))} // Ensure end > start
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={handleTrim}
                        disabled={!ffmpeg || isProcessing}
                    >
                        {isProcessing ? "Processing..." : "Apply Trim"}
                    </button>
                </div>
            </div>
        </div>
    );
}
