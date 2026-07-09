import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, transactions, balance } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        // Fallback mock if no API key
        return res.json({
          response: "El asistente IA está en modo simulado (faltan credenciales). Tus gastos recientes muestran una actividad normal. ¡Mantén el buen trabajo!"
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `Eres 'Bóveda AI', un asistente financiero amigable de una billetera digital. 
      Respondes en español, con un tono profesional pero cercano.
      Aquí están los datos del usuario:
      Saldo actual: $${balance}
      Últimos movimientos:
      ${transactions.map((t: any) => `- ${t.date.split('T')[0]}: ${t.description} ($${t.amount})`).join('\n')}
      
      Analiza los gastos, transferencias e ingresos si el usuario te lo pide, y dale feedback o consejos financieros basados en estos datos.
      Mantén tus respuestas concisas y claras. No uses formato Markdown complejo, solo texto simple.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: message }] }],
        config: {
          systemInstruction,
        }
      });

      res.json({ response: response.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Error al comunicarse con el asistente." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
