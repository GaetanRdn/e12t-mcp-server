import express from 'express';
import cors from 'cors';
import { getContextChunks } from './context.js';
import { buildPrompt } from './prompt.js';
import { generateFromPrompt } from "./generate.js";

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
    const { q } = req.body;
    if (!q) return res.status(400).json({ error: 'Missing q (question)' });

    const chunks = getContextChunks(q, 3);
    const prompt = buildPrompt(chunks, q);
    const answer = await generateFromPrompt(prompt);

    res.json({ question: q, answer });
});

app.listen(port, () => {
    console.log(`✅ E12T MCP server listening at http://localhost:${port}`);
});
