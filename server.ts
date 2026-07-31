import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client server-side lazily
  let aiClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY environment variable is missing.');
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey || '',
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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
4. **deliveryMethodComparison**: Explain why Targeted Delivery (Hydrogel/Nanoparticle wound patch) reduces systemic neuro-stress while maintaining or enhancing local neoblast regeneration.
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
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in Gemini analysis route:', error);
      res.status(500).json({
        error: 'Failed to analyze experiment via Gemini AI',
        details: error.message || 'Unknown error',
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
