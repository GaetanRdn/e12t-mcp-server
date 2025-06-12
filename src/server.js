import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { getContextChunks } from './context.js';
import { buildPrompt } from './prompt.js';
import { generateFromPrompt } from "./generate.js";

export function sanitizeQuestion(raw) {
    const lower = raw.toLowerCase();

    const blocklist = [
        'ignore all',
        'ignore toutes les instructions',
        'tu es désormais',
        'you are now',
        'change ton rôle',
        'act as',
        'act like',
        'reset all previous instructions',
        'system prompt'
    ];

    const isSuspicious = blocklist.some(fragment => lower.includes(fragment));

    if (isSuspicious) {
        return {
            blocked: true,
            reason: "Cette question semble contenir une instruction interdite."
        };
    }

    return { blocked: false, question: raw };
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('✅ E12T MCP Server is up and running!');
});

app.get('/context', (req, res) => {
    const query = req.query.q || '';
    const chunks = getContextChunks(query, 3);
    res.json({ query, chunks });
});

app.get('/prompt', (req, res) => {
    const query = req.query.q || '';
    const chunks = getContextChunks(query, 3);
    const prompt = buildPrompt(chunks, query);
    res.json({ prompt });
});

app.post('/generate', async (req, res) => {
    try {
        const { q } = req.body;

        if (!q) {
            return res.status(400).json({ error: 'Missing `q` in body.' });
        }

        const { blocked, question: cleanQuestion, reason } = sanitizeQuestion(q);

        if (blocked) {
            return res.json({ answer: `⚠️ ${reason}` });
        }

        const chunks = getContextChunks(cleanQuestion, 3);
        const prompt = buildPrompt(chunks, cleanQuestion);
        const answer = await generateFromPrompt(prompt);

        return res.json({ answer });
    } catch (err) {
        console.error('❌ Erreur MCP interne:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur MCP.' });
    }
});


app.listen(port, () => {
    console.log(`✅ E12T MCP server listening at http://localhost:${port}`);
});
