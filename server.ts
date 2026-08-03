import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Check Gemini API Key configuration on startup
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
    console.error('GEMINI_API_KEY is not configured');
  }

  // Helper function to sanitize logs and strip potential API keys
  function sanitizeError(error: any): { statusCode: number; message: string } {
    const rawMsg = error?.message || String(error || 'Unknown error');
    const statusCode = error?.status || error?.statusCode || 500;
    let cleanMsg = rawMsg;

    if (process.env.GEMINI_API_KEY) {
      cleanMsg = cleanMsg.replaceAll(process.env.GEMINI_API_KEY, '[REDACTED_KEY]');
    }
    cleanMsg = cleanMsg
      .replace(/key=[^&"'\s]+/gi, 'key=[REDACTED]')
      .replace(/x-goog-api-key:\s*[^\s]+/gi, 'x-goog-api-key: [REDACTED]');

    return { statusCode, message: cleanMsg };
  }

  // Initialize Gemini Client server-side lazily
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      console.error('GEMINI_API_KEY is not configured');
      throw new Error('GEMINI_API_KEY is not configured');
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint: Health check
  app.get('/api/health', (req, res) => {
    const isConfigured = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
    );
    res.json({
      status: 'ok',
      geminiKeyConfigured: isConfigured,
    });
  });

  // API endpoint: Gemini connection test
  const handleGeminiTest = async (req: express.Request, res: express.Response) => {
    try {
      if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
        console.error('GEMINI_API_KEY is not configured');
        return res.status(500).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured',
        });
      }

      const ai = getGenAI();
      await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Test connection',
      });

      res.json({
        success: true,
        message: 'Gemini API connection successful',
      });
    } catch (error: any) {
      const { statusCode, message } = sanitizeError(error);
      console.error(`Gemini API Error [Status ${statusCode}]: ${message}`);
      res.status(statusCode).json({
        success: false,
        error: 'Gemini API connection failed',
        details: message,
      });
    }
  };

  app.get('/api/gemini-test', handleGeminiTest);
  app.post('/api/gemini-test', handleGeminiTest);

  // API endpoint: Live Literature Search for Planarian Neoblasts & Drug Effects
  app.post('/api/search-literature', async (req, res) => {
    try {
      const { drugName, query } = req.body;
      const searchQuery = query || `planarian neoblast cell division mitosis regeneration ${drugName || 'nicotine'}`;

      const prompt = `Search for real scientific research papers and PubMed literature regarding planarian stem cells (neoblasts), cell division (mitosis), regeneration, or behavioral toxicity related to: "${searchQuery}".

Find 2 to 3 real or highly accurate peer-reviewed studies published in scientific journals (e.g., Development, Dev Biol, Neurotoxicology, Scientific Reports, PLoS ONE).
Return a JSON array of objects with the following structure:
[
  {
    "title": "Full title of paper",
    "authors": "Author list (e.g. Smith A, et al.)",
    "year": 2021,
    "journal": "Journal Name",
    "doi": "10.xxxx/xxxxx or empty string",
    "pubmedId": "PubMed ID or empty string",
    "drugId": "${(drugName || 'nicotine').toLowerCase()}",
    "drugName": "${drugName || 'Nicotine'}",
    "concentration": "tested concentration range",
    "minConcValue": 0.1,
    "maxConcValue": 1.0,
    "cutLocation": "trunk",
    "findings": {
      "regenerationRateDay7": 70,
      "regenerationRateDay14": 90,
      "stemCellActivityIndex": 75,
      "eyeSpotEtaDays": 5.0,
      "completeEtaDays": 9.5,
      "scrunchingFrequency": 10.0,
      "hyperkinesiaScore": 60,
      "survivalRate": 95,
      "stressIndex": 50
    },
    "notes": "Key findings regarding neoblast mitosis, cell division rate, and regeneration.",
    "isRealData": true
  }
]
Return ONLY valid JSON array. No markdown markup or conversational text outside the JSON.`;

      const ai = getGenAI();
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.6-pro'];
      let response = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                tools: [{ googleSearch: {} }],
              },
            });
            if (response) break;
          } catch (err: any) {
            lastError = err;
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 800));
            }
          }
        }
        if (response) break;
      }

      if (!response) {
        throw lastError || new Error('Search failed');
      }

      const text = response.text || '[]';
      // Clean json string from potential markdown codeblocks
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      let papers = [];
      try {
        papers = JSON.parse(cleanedJson);
      } catch (e) {
        // Fallback extract json array using regex
        const match = cleanedJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          papers = JSON.parse(match[0]);
        }
      }

      res.json({ papers, query: searchQuery });
    } catch (error: any) {
      const { statusCode, message } = sanitizeError(error);
      console.error(`Gemini API Error in /api/search-literature [Status ${statusCode}]: ${message}`);
      res.status(statusCode).json({ error: 'Failed to search literature', details: message });
    }
  });

  // API endpoint: Gemini Paper Analysis & Mechanism Explanation
  app.post('/api/analyze-experiment', async (req, res) => {
    try {
      const {
        drugName,
        concentration,
        unit,
        exposureHours,
        cutLocation,
        submersionMetrics,
        targetedMetrics,
        matchingPaper,
      } = req.body;

      const prompt = `You are an expert scientist in developmental biology, regenerative medicine, and pharmacology specializing in planarian stem cells (neoblasts) and neuro-behavioral pharmacology (*Schmidtea mediterranea* / *Dugesia japonica*).

Analyze the following experimental simulation configuration and compare direct neoblast stem cell impact vs indirect neuro-excitation stress:

[EXPERIMENTAL CONDITIONS]
- Drug: ${drugName}
- Concentration: ${concentration} ${unit}
- Exposure Duration: ${exposureHours} hours
- Amputation Location: ${cutLocation} (head anterior, trunk mid-body, or tail posterior)

[SUBMERSION METHOD RESULTS (Whole Body Exposure)]
- Regeneration Rate (Day 14): ${submersionMetrics.finalRegenerationRate}%
- Stem Cell Activity Index: ${submersionMetrics.stemCellActivityIndex}/100
- Eye Spot Appearance ETA: ${submersionMetrics.eyeSpotEtaDays} days
- Complete Regeneration ETA: ${submersionMetrics.completeEtaDays} days
- Scrunching Contraction Frequency: ${submersionMetrics.scrunchingFrequency} events/min
- Hyperkinesia Score: ${submersionMetrics.hyperkinesiaScore}/100
- Stress Index: ${submersionMetrics.stressIndex}/100
- Survival Rate: ${submersionMetrics.survivalRate}%

[TARGETED DRUG DELIVERY METHOD RESULTS (Hydrogel/Nanoparticle Wound Localized Release)]
- Regeneration Rate (Day 14): ${targetedMetrics.finalRegenerationRate}%
- Stem Cell Activity Index: ${targetedMetrics.stemCellActivityIndex}/100
- Stress Index: ${targetedMetrics.stressIndex}/100
- Scrunching Contraction Frequency: ${targetedMetrics.scrunchingFrequency} events/min

[MATCHING LITERATURE IN DATABASE]
${
  matchingPaper
    ? `Title: ${matchingPaper.title}\nAuthors: ${matchingPaper.authors} (${matchingPaper.year})\nJournal: ${matchingPaper.journal}\nDOI: ${matchingPaper.doi || 'N/A'}\nFindings: ${matchingPaper.notes}`
    : 'No exact paper match found in static database. Trend extrapolated from pharmacological class.'
}

Task:
Provide a scientific analysis in Korean (한국어) with the following structured sections:
1. **literatureMatchSummary**: Compare this experiment against published literature. Identify similar real-world published studies on planarian regeneration.
2. **directNeoblastMechanism**: Explain the direct cellular/molecular mechanism on neoblasts (e.g. piwi/smedwi, ERK/mTOR signaling, mitosis G2/M arrest, bioelectric ion channels, blastema migration).
3. **indirectNeuroStressMechanism**: Explain the indirect neuro-muscular stress mechanism (e.g., cholinergic/adrenergic motor excitation, C-shape scrunching reflexes, muscular exhaustion).
4. **deliveryMethodComparison**: Explain why Targeted Delivery (Hydrogel/Nanoparticle wound patch) reduces systemic neuro-stress while maintaining or enhancing local neoblast regeneration. Note: If the drug is Acetylcholine (or cholinergic), explicitly explain that Acetylcholine is rapidly hydrolyzed within seconds in vivo by acetylcholinesterase (AChE), making simple local delivery challenging, and recommend improvements like substituting with AChE-resistant analogs such as Carbachol or nanoparticle encapsulation. Also note that all drugs should be checked for local delivery efficiency.
5. **scientificConclusion**: Concise takeaway for students or researchers.
6. **references**: List 2-3 key scientific references with Title, Authors, Year, Journal, and DOI/PubMed ID if available.

Return your response strictly as valid JSON matching this schema:
{
  "literatureMatchSummary": "string",
  "directNeoblastMechanism": "string",
  "indirectNeuroStressMechanism": "string",
  "deliveryMethodComparison": "string",
  "scientificConclusion": "string",
  "references": [
    {
      "title": "string",
      "authors": "string",
      "year": 2020,
      "journal": "string",
      "doi": "string",
      "pubmedId": "string",
      "isRealData": true
    }
  ]
}`;

      const ai = getGenAI();
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.6-pro'];
      let response = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            });
            if (response) break;
          } catch (err: any) {
            lastError = err;
            const { statusCode, message } = sanitizeError(err);
            console.warn(`Attempt ${attempt} for model ${modelName} failed [Status ${statusCode}]: ${message}`);
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
        if (response) break;
      }

      if (!response) {
        throw lastError || new Error('All model generation attempts failed');
      }

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      const { statusCode, message } = sanitizeError(error);
      console.error(`Gemini API Error in /api/analyze-experiment [Status ${statusCode}]: ${message}`);
      res.status(statusCode).json({
        error: 'Failed to analyze experiment via Gemini AI',
        details: message,
      });
    }
  });

  // Vite middleware for dev or static server for production
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
