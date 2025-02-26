// DOM Elements
const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');
const enhanceBtn = document.getElementById('enhance-btn');
const trimBtn = document.getElementById('trim-btn');
const effectsBtn = document.getElementById('effects-btn');
const status = document.getElementById('status');

// FFmpeg Setup (Single-Threaded)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true,
    mainName: 'main', // Explicitly use single-threaded main
    corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.0/dist/ffmpeg-core.js' // Single-threaded core
});

let currentFile = null;

// Load FFmpeg with detailed feedback
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
        currentFile = file;
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.style.display = 'block';
        status.textContent = 'Video loaded! Select an AI edit.';
        enhanceBtn.disabled = false;
        trimBtn.disabled = false;
        effectsBtn.disabled = false;
    } else {
        status.textContent = 'Please upload a valid video (e.g., MP4).';
    }
}

// Enhance: Boost brightness and contrast
enhanceBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Enhancing video...';
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        await ffmpeg.run('-i', 'input.mp4', '-vf', 'eq=brightness=0.15:contrast=1.2', '-c:a', 'copy', 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'enhanced.mp4', { type: 'video/mp4' });
        status.textContent = 'Video enhanced!';
    } catch (error) {
        status.textContent = 'Enhance failed.';
        console.error('Enhance error:', error);
    }
});

// Trim: Cut to 10 seconds from 5-second mark
trimBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Trimming video...';
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        await ffmpeg.run('-i', 'input.mp4', '-ss', '5', '-t', '10', '-c:v', 'copy', '-c:a', 'copy', 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'trimmed.mp4', { type: 'video/mp4' });
        status.textContent = 'Video trimmed!';
    } catch (error) {
        status.textContent = 'Trim failed.';
        console.error('Trim error:', error);
    }
});

// Effects: Apply sepia filter
effectsBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Adding effects...';
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        await ffmpeg.run('-i', 'input.mp4', '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131', '-c:a', 'copy', 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'effect.mp4', { type: 'video/mp4' });
        status.textContent = 'Effects added!';
    } catch (error) {
        status.textContent = 'Effects failed.';
        console.error('Effects error:', error);
    }
});
