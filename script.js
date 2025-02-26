const dropZone = document.getElementById('drop-zone');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');

// Open file input when clicking drop zone
dropZone.addEventListener('click', () => videoUpload.click());

// Handle drag-and-drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    previewVideo(file);
});

// Handle file input
videoUpload.addEventListener('change', () => {
    const file = videoUpload.files[0];
    previewVideo(file);
});

function previewVideo(file) {
    if (file && file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        videoPreview.src = url;
        videoPreview.style.display = 'block';
    }
}
