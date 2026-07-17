import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Suggestions
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { diagnosis } = req.body;
      if (!diagnosis) {
        return res.status(400).json({ error: "Diagnosis is required" });
      }

      const prompt = `Dựa vào chẩn đoán y khoa sau: "${diagnosis}", hãy gợi ý ít nhất 5 câu hỏi cụ thể mà nhân viên điều dưỡng nên hỏi bệnh nhân để khai thác thêm thông tin bệnh sử và tình trạng hiện tại nhằm lập kế hoạch chăm sóc tốt nhất. Trả về kết quả dưới dạng danh sách gạch đầu dòng bằng tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ suggestions: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
