"use client";

import { useState } from "react";
import Recorder from "@/components/Recorder";
import Editor from "@/components/Editor";
import styles from "./page.module.css";

export default function Home() {
  const [view, setView] = useState<"recording" | "editing">("recording");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setView("editing");
  };

  const handleBack = () => {
    setRecordedBlob(null);
    setView("recording");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.logo}>ScreenShare</h1>
        </div>
      </header>

      <main className="container">
        {view === "recording" && (
          <div className={styles.heroSection}>
            <Recorder onRecordingComplete={handleRecordingComplete} />
          </div>
        )}

        {view === "editing" && recordedBlob && (
          <div className={styles.editorSection}>
            <Editor recordedBlob={recordedBlob} onBack={handleBack} />
          </div>
        )}
      </main>
    </div>
  );
}
