import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: AI Assistant with Google Search Grounding
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction:
          'You are an expert C++, CMake, FFmpeg, and yt-dlp engineer assisting a Japanese developer who is a beginner. Provide clear, accurate, friendly, and practical answers in Japanese. You have access to Google Search to look up the latest yt-dlp flags, Bilibili extraction caveats, CMake cross-compilation parameters, and Termux/Android/Debian packages.',
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter(Boolean)
      .map((web: any) => ({
        title: web.title || web.uri,
        uri: web.uri,
      }));

    res.json({
      text,
      sources,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/assist:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI assistant request.',
    });
  }
});

// API: URL parsing simulation & extraction preview
app.post('/api/parse-url-preview', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const trimmedUrl = String(url).trim();
    let platform = 'unknown';
    let sampleTitle = 'Sample Video Title';
    let sampleUploader = 'Sample Creator';
    let videoId = '';

    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
      platform = 'YouTube';
      const match = trimmedUrl.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : 'sample_id';
      sampleTitle = 'Amazing C++ Cross-Platform Development Guide';
      sampleUploader = 'OpenSource Dev';
    } else if (trimmedUrl.includes('bilibili.com') || trimmedUrl.includes('b23.tv')) {
      platform = 'Bilibili';
      const match = trimmedUrl.match(/(BV[0-9a-zA-Z]+|av[0-9]+)/i);
      videoId = match ? match[1] : 'BV1xx411c7mD';
      sampleTitle = 'C++与FFmpeg跨平台媒体处理实践';
      sampleUploader = '极客工程师_Bili';
    } else {
      return res.status(400).json({
        error: '対応していないURLです。YouTubeまたはBilibiliのURLを入力してください。',
      });
    }

    // Function to sanitize filename like our C++ program
    const sanitize = (str: string) => {
      return str
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const cleanTitle = sanitize(sampleTitle);
    const cleanUploader = sanitize(sampleUploader);
    const filename1 = `${cleanTitle} - ${cleanUploader}.mp4`;
    const filename2 = `${cleanUploader} - ${cleanTitle}.mp4`;

    res.json({
      platform,
      videoId,
      url: trimmedUrl,
      title: sampleTitle,
      uploader: sampleUploader,
      sanitizedTitle: cleanTitle,
      sanitizedUploader: cleanUploader,
      formattedFilename: filename1,
      reversedFilename: filename2,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
