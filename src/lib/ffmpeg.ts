import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Singleton instance to avoid reloading if possible, though load() checks state.
let ffmpegInstance: FFmpeg | null = null;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
    if (ffmpegInstance) {
        return ffmpegInstance;
    }

    const ffmpeg = new FFmpeg();

    // Use unpkg to serve the core files
    // Ensure we match the version of @ffmpeg/core compatible with the installed @ffmpeg/ffmpeg
    // For 0.12.x of ffmpeg/ffmpeg, we typically use 0.12.x of core.
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    try {
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegInstance = ffmpeg;
        return ffmpeg;
    } catch (error) {
        console.error("Failed to load FFmpeg", error);
        throw error;
    }
};
