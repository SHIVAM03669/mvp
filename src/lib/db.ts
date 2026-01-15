import fs from 'fs/promises';
import path from 'path';
import { Video } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function ensureDB() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, '[]');
    }
}

async function readDB(): Promise<Video[]> {
    await ensureDB();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data: Video[]) {
    await ensureDB();
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function getVideos(): Promise<Video[]> {
    return readDB();
}

export async function getVideo(id: string): Promise<Video | undefined> {
    const videos = await readDB();
    return videos.find((v) => v.id === id);
}

export async function createVideo(video: Video): Promise<void> {
    const videos = await readDB();
    videos.push(video);
    await writeDB(videos);
}

export async function incrementViews(id: string): Promise<void> {
    const videos = await readDB();
    const videoIndex = videos.findIndex((v) => v.id === id);
    if (videoIndex > -1) {
        videos[videoIndex].views += 1;
        await writeDB(videos);
    }
}

// Simple logic: new completion rate = ((current_rate * watches) + new_rate) / (watches + 1)
// We already increment views (watches) separately? Let's just treat "views" as "starts".
// Let's add a separate method or just update completion.
export async function updateCompletion(id: string, completionPercentage: number): Promise<void> {
    const videos = await readDB();
    const videoIndex = videos.findIndex((v) => v.id === id);
    if (videoIndex > -1) {
        const video = videos[videoIndex];
        // Weighted average
        const totalWatches = video.totalWatches || 0; // Guard against old data if applicable
        const currentAvg = video.completionRate || 0;

        const newTotalWatches = totalWatches + 1;
        const newAvg = ((currentAvg * totalWatches) + completionPercentage) / newTotalWatches;

        video.completionRate = newAvg;
        video.totalWatches = newTotalWatches;

        await writeDB(videos);
    }
}
