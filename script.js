const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');
const enhanceBtn = document.getElementById('enhance-btn');
const trimBtn = document.getElementById('trim-btn');
const effectsBtn = document.getElementById('effects-btn');
const status = document.getElementById('status');
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true }); // Set log: true for debugging

let currentFile = null;

// Load FFmpeg when the page starts
async function loadFFmpeg() {
    status.textContent = 'Loading video editor...';
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    status.textContent = 'Editor ready! Upload a video to start.';
}
loadFFmpeg();

// Drag-and-drop and upload handling
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
        status.textContent = 'Video loaded. Choose an edit!';
        enhanceBtn.disabled = false;
        trimBtn.disabled = false;
        effectsBtn.disabled = false;
    } else {
        status.textContent = 'Please upload a valid video file.';
    }
}

// Enhance: Increase brightness
enhanceBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Enhancing video...';
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
    await ffmpeg.run('-i', 'input.mp4', '-vf', 'eq=brightness=0.1', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    videoPreview.src = url;
    currentFile = new File([data.buffer], 'enhanced.mp4', { type: 'video/mp4' });
    status.textContent = 'Video enhanced!';
});

// Trim: Cut to 10 seconds starting at 5
trimBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Trimming video...';
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
    await ffmpeg.run('-i', 'input.mp4', '-ss', '5', '-t', '10', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    videoPreview.src = url;
    currentFile = new File([data.buffer], 'trimmed.mp4', { type: 'video/mp4' });
    status.textContent = 'Video trimmed!';
});

// Effects: Add a sepia filter
effectsBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Adding effects...';
    await loadFFmpeg();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(currentFile));
    await ffmpeg.run('-i', 'input.mp4', '-vf', 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131', 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    videoPreview.src = url;
    currentFile = new File([data.buffer], 'effect.mp4', { type: 'video/mp4' });
    status.textContent = 'Effects added!';
});
