# Screen Recording & Sharing MVP

A lightweight MVP that allows users to record their screen and microphone directly in the browser, trim the recording, upload it, and share it via a public link with basic viewing analytics.

---

> [!CAUTION]
> **Deployment Notice**: This MVP uses **Mocked Storage (Local Filesystem)**. It is designed to run **LOCALLY**.
> If you deploy this to Netlify/Vercel, uploads will **FAIL** because serverless functions have R/O filesystems.
> For production deployment, you must implement S3/R2 storage in `src/app/api/upload/route.ts`.

##  Features

###  Screen Recording

* Record **screen + microphone audio** using the **MediaRecorder API**
* Start / Stop recording controls
* Save raw recording as `.webm`

###  Video Trimming

* Trim video by **start time** and **end time**
* Export trimmed video as **WebM**
* Trimming handled using **ffmpeg.wasm** (runs fully in browser)

###  Upload & Share

* Upload final video to storage (Mocked Local Filesystem - **Local Only**)
* Generate a **public shareable link**
* Public page with embedded video player

###  Basic Analytics

* View count tracking
* Watch completion percentage tracking
* Persistent data storage (file-based or database)

---

##  Tech Stack

* **Next.js (App Router)**
* **TypeScript**
* **MediaRecorder API**
* **ffmpeg.wasm**
* **Tailwind CSS** (optional, minimal UI)
* **File-based storage / Mock S3**
* **Node.js API routes**

---

##  Project Structure

```
.
├── app/
│   ├── page.tsx               # Recording UI
│   ├── share/[id]/page.tsx    # Public video player page
│
├── components/
│   ├── Recorder.tsx
│   ├── VideoTrimmer.tsx
│   ├── VideoPlayer.tsx
│
├── lib/
│   ├── ffmpeg.ts              # ffmpeg.wasm setup
│   ├── storage.ts             # Upload + retrieval logic
│   ├── analytics.ts           # View & completion tracking
│
├── pages/api/
│   ├── upload.ts              # Upload endpoint
│   ├── analytics.ts           # Analytics update
│
├── public/uploads/            # Mock storage
├── data/analytics.json        # Persistent analytics data
│
├── README.md
└── package.json
```

---

##  Setup Instructions

### 1️ Clone the repository

```bash
git clone https://github.com/your-username/screen-recorder-mvp.git
cd screen-recorder-mvp
```

### 2️ Install dependencies

```bash
npm install
```

### 3️ Run the development server

```bash
npm run dev
```

### 4️ Open in browser

```
http://localhost:3000
```

---

##  Architecture Decisions

### Screen Recording

* Used **MediaRecorder API** for native browser support
* Records screen and microphone simultaneously
* Saves raw output as `.webm` to avoid transcoding overhead

### Video Trimming

* Chose **ffmpeg.wasm** to keep trimming client-side
* Avoids server CPU cost and simplifies deployment
* Enables instant preview and export

### Upload & Storage

* Upload handled via Next.js API route
* Storage mocked using local filesystem (`/public/uploads`)
* Easily replaceable with **AWS S3 / Cloudflare R2**

### Public Sharing

* Each upload generates a unique ID
* Public route `/share/[id]` embeds the video
* No authentication required for viewing

### Analytics

* View count increments on page load
* Completion percentage calculated using video `timeupdate` + `ended`
* Data persisted in JSON file (can be swapped for DB)

---

##  Analytics Logic

* **View Count:**
  Incremented when the public page loads

* **Watch Completion %:**

  ```
  watchedSeconds / totalDuration * 100
  ```

* Stored per video ID for persistence

---

##  UI Approach

* Minimal and functional UI
* Focused on clarity over polish
* Tailwind used optionally for fast styling
* Designed to showcase functionality, not visual complexity

---

##  What I Would Improve for Production

1. **Storage**

   * Move from local storage to **S3 / R2**
   * Signed URLs for secure uploads

2. **Database**

   * Replace JSON files with **PostgreSQL / Prisma**
   * Better analytics aggregation

3. **Video Processing**

   * Optional server-side ffmpeg for MP4 exports
   * Background jobs using queues (BullMQ)

4. **Authentication**

   * User accounts and private videos
   * Access control for shared links

5. **Scalability**

   * CDN for video delivery
   * Edge analytics tracking

6. **UX Enhancements**

   * Timeline-based trimming UI
   * Recording previews
   * Error recovery for permission issues

---

##  Assignment Coverage Checklist

*  Screen + mic recording
*  Start / Stop controls
*  WebM output
*  Video trimming
*  ffmpeg usage
*  Upload + share link
*  Public player page
*  Analytics with persistence
*  Next.js + TypeScript
*  Clean structure
*  README with setup & architecture

---

