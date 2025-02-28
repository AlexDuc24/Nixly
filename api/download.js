const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
    const { url } = req.query;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid YouTube URL');
    }
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        ytdl(url, { format }).pipe(res);
    } catch (error) {
        res.status(500).send('Download failed: ' + error.message);
    }
};
