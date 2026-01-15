"use client";

import React, { useState, useRef, useEffect } from "react";
import { Video, Square, Monitor } from "lucide-react";
import styles from "./Recorder.module.css";

interface RecorderProps {
    onRecordingComplete: (blob: Blob) => void;
}

export default function Recorder({ onRecordingComplete }: RecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startRecording = async () => {
        try {
            // Request screen sharing
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true, // System audio
            });

            // Optional: Add mic audio mixed in? 
            // User requirements: "Record screen + mic". 
            // DisplayMedia gives system audio. To get mic, we need getUserMedia and mix tracks.
            // For MVP simplicity, let's try to get mic as well.
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Add mic tracks to the mix
                audioStream.getAudioTracks().forEach(track => mediaStream.addTrack(track));
            } catch (err) {
                console.warn("Mic permission denied or error", err);
            }

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            const recorder = new MediaRecorder(mediaStream, {
                mimeType: "video/webm; codecs=vp9", // or vp8
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                chunksRef.current = [];
                stopStream(mediaStream);
                onRecordingComplete(blob);
            };

            // Handle user stopping sharing via browser UI
            mediaStream.getVideoTracks()[0].onended = () => {
                stopRecording();
            };

            recorder.start();
            setIsRecording(true);
            mediaRecorderRef.current = recorder;

        } catch (err) {
            console.error("Error starting recording:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const stopStream = (mediaStream: MediaStream) => {
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
    };

    return (
        <div className={styles.container}>
            {!isRecording ? (
                <div className={styles.hero}>
                    <div className={styles.iconWrapper}>
                        <Monitor size={48} />
                    </div>
                    <h2>Start Recording</h2>
                    <p>Capture your screen and share it instantly.</p>
                    <button className="btn btn-primary" onClick={startRecording}>
                        <Video size={20} />
                        Start New Recording
                    </button>
                </div>
            ) : (
                <div className={styles.recordingState}>
                    <div className={styles.status}>
                        <div className={styles.recordingDot}></div>
                        Recording...
                    </div>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={styles.preview}
                    />
                    <button className="btn btn-destructive" onClick={stopRecording}>
                        <Square size={20} />
                        Stop Recording
                    </button>
                </div>
            )}
        </div>
    );
}
