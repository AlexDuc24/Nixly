// DOM Elements
const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');
const enhanceBtn = document.getElementById('enhance-btn');
const trimBtn = document.getElementById('trim-btn');
const effectsBtn = document.getElementById('effects-btn');
const status = document.getElementById('status');

// FFmpeg Setup
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true, // Logs FFmpeg output in console for debugging
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js' // Ensures compatibility
});

let currentFile = null;

// Load FFmpeg on page load
async function loadFFmpeg() {
    status.textContent = 'Initializing AI Video Editor...';
    try {
        if (!ffmpeg.isLoaded()) await ffmpeg.load();
        status.textContent = 'Ready! Upload a video to begin.';
    } catch (error) {
        status.textContent = 'Error loading editor. Please refresh.';
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
    status.textContent = 'Enhancing video with AI...';
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        await ffmpeg.run(
            '-i', 'input.mp4',
            '-vf', 'eq=brightness=0.15:contrast=1.2', // Brighten and sharpen
            '-c:a', 'copy', // Keep audio intact
            'output.mp4'
        );
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'enhanced.mp4', { type: 'video/mp4' });
        status.textContent = 'Video enhanced successfully!';
    } catch (error) {
        status.textContent = 'Enhance failed. Try a smaller video.';
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
        await ffmpeg.run(
            '-i', 'input.mp4',
            '-ss', '5', // Start at 5 seconds
            '-t', '10', // Duration of 10 seconds
            '-c:v', 'copy', // Fast video copy
            '-c:a', 'copy', // Fast audio copy
            'output.mp4'
        );
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'trimmed.mp4', { type: 'video/mp4' });
        status.textContent = 'Video trimmed successfully!';
    } catch (error) {
        status.textContent = 'Trim failed. Check video format.';
        console.error('Trim error:', error);
    }
});

// Effects: Apply a vintage sepia filter
effectsBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Adding AI effects...';
    try {
        await loadFFmpeg();
        ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
        await ffmpeg.run(
            '-i', 'input.mp4',
            '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131', // Sepia filter
            '-c:a', 'copy',
            'output.mp4'
        );
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPreview.src = url;
        currentFile = new File([data.buffer], 'effect.mp4', { type: 'video/mp4' });
        status.textContent = 'Effects added successfully!';
    } catch (error) {
        status.textContent = 'Effects failed. Try again.';
        console.error('Effects error:', error);
    }
});
