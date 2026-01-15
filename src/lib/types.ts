export interface Video {
    id: string;
    createdAt: string;
    views: number;
    completionRate: number; // Stored as a percentage (0-100)
    totalWatches: number; // To calculate average completion
    filename: string;
}
