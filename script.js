const dropZone = document.getElementById('drop-zone');
const imagePrompt = document.getElementById('image-prompt');
const generateImageBtn = document.getElementById('generate-image');
const generatedImage = document.getElementById('generated-image');
const chatInput = document.getElementById('chat-input');
const chatBtn = document.getElementById('chat-btn');
const chatOutput = document.getElementById('chat-output');
const youtubeUrl = document.getElementById('youtube-url');
const downloadYoutubeBtn = document.getElementById('download-youtube');
const downloadStatus = document.getElementById('download-status');

// Image Generator (mock for now, replace with API later)
generateImageBtn.addEventListener('click', async () => {
    const prompt = imagePrompt.value.trim();
    if (!prompt) return;
    generatedImage.style.display = 'block';
    generatedImage.src = 'https://via.placeholder.com/300?text=Nixly+' + encodeURIComponent(prompt); // Placeholder
    imagePrompt.value = '';
    // Future: Use Hugging Face API or similar
});

// Chatbot (simple mock, replace with API later)
chatBtn.addEventListener('click', () => {
    const input = chatInput.value.trim();
    if (!input) return;
    chatOutput.innerHTML += `<p>You: ${input}</p>`;
    chatOutput.innerHTML += `<p>Nixly Buddy: How about a video of "${input} in a neon disco"? Coming soon with real AI!</p>`;
    chatInput.value = '';
    // Future: Integrate xAI Grok or similar
});

// YouTube Downloader
downloadYoutubeBtn.addEventListener('click', async () => {
    const url = youtubeUrl.value.trim();
    if (!url) return;
    downloadStatus.textContent = 'Downloading...';
    try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'nixly-video.mp4';
        a.click();
        URL.revokeObjectURL(downloadUrl);
        downloadStatus.textContent = 'Download complete!';
    } catch (error) {
        downloadStatus.textContent = 'Error: ' + error.message;
    }
});
