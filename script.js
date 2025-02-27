// DOM Elements
const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');
const enhanceBtn = document.getElementById('enhance-btn');
const trimBtn = document.getElementById('trim-btn');
const effectsBtn = document.getElementById('effects-btn');
const downloadBtn = document.getElementById('download-btn');
const status = document.getElementById('status');

// FFmpeg Setup (Single-Threaded)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true,
    mainName: 'main',
    corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.0/dist/ffmpeg-core.js'
});

let currentFile = null;
let processedVideoUrl = null;

// Load FFmpeg
async function loadFFmpeg() {
    status.textContent = 'Initializing AI Video Editor...';
    try {
        if (!ffmpeg.isLoaded()) {
            console.log('Starting FFmpeg load (single-threaded)...');
            await ffmpeg.load();
            console.log('FFmpeg loaded successfully!');
        }
        status.textContent = 'Ready! Upload a video to begin.';
    } catch (error) {
        status.textContent = `Error: ${error.message}. Refresh or check console.`;
        console.error('FFmpeg load failed:', error);
    }
}
loadFFmpeg();

// Upload Handling
dropZone.addEventListener('click', () => videoUpload.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});
videoUpload.addEventListener('change', () => handleFile(videoUpload.files[0]));

function handleFile(file) {
    if (file && file.type.startsWith('video/')) {
        if (file.size > 20 * 1024 * 1024) {
            status.textContent = 'File too large (>20MB). Please upload a smaller video.';
            return;
        }
        currentFile = file;
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.style.display = 'block';
        downloadBtn.style.display = 'none';
        processedVideoUrl = null;
        status.textContent = 'Video loaded! Select an AI edit.';
        enhanceBtn.disabled = false;
        trimBtn.disabled = false;
        effectsBtn.disabled = false;
    } else {
        status.textContent = 'Please upload a valid video (e.g., MP4).';
    }
}

// Helper: Force UI update before processing
function forceUIUpdate(message) {
    status.textContent = message;
    status.classList.add('processing');
    return new Promise(resolve => setTimeout(resolve, 100)); // Brief delay to render
}

// Helper: Process video with progress updates and download
async function processVideo(command, outputName, successMessage) {
    if (!currentFile) return;
    status.textContent = 'Processing may take up to 15 seconds. Please wait...';
    status.classList.add('processing');
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay for UI render
    console.log('Starting video processing...');
    enhanceBtn.disabled = true;
    trimBtn.disabled = true;
    effectsBtn.disabled = true;
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        console.log('Running FFmpeg command:', command);
        await ffmpeg.run(...command);
        const data = ffmpeg.FS('readFile', 'output.mp4');
        processedVideoUrl = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = processedVideoUrl;
        currentFile = new File([data.buffer], outputName, { type: 'video/mp4' });
        status.textContent = successMessage;
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = processedVideoUrl;
            a.download = outputName;
            a.click();
        };
        console.log('Processing complete!');
    } catch (error) {
        status.textContent = 'Processing failed. Try a smaller or shorter video.';
        console.error('Processing error:', error);
    } finally {
        status.classList.remove('processing');
        enhanceBtn.disabled = false;
        trimBtn.disabled = false;
        effectsBtn.disabled = false;
    }
}

// Enhance: Boost brightness and contrast
enhanceBtn.addEventListener('click', () => {
    processVideo(
        ['-i', 'input.mp4', '-vf', 'eq=brightness=0.1:contrast=1.1,scale=320:180', '-c:a', 'copy', '-preset', 'superfast', '-crf', '30', 'output.mp4'],
        'enhanced-video.mp4',
        'Video enhanced!'
    );
});

// Trim: Cut exactly 10 seconds from 5-second mark
trimBtn.addEventListener('click', () => {
    processVideo(
        ['-i', 'input.mp4', '-ss', '5', '-t', '10', '-avoid_negative_ts', '1', '-c:v', 'libx264', '-c:a', 'copy', '-preset', 'superfast', '-crf', '30', 'output.mp4'],
        'trimmed-video.mp4',
        'Video trimmed to 10 seconds!'
    );
});

// Effects: Grayscale filter
effectsBtn.addEventListener('click', () => {
    processVideo(
        ['-i', 'input.mp4', '-vf', 'hue=s=0,scale=320:180', '-c:a', 'copy', '-preset', 'superfast', '-crf', '30', 'output.mp4'],
        'grayscale-video.mp4',
        'Grayscale effect added!'
    );
});
