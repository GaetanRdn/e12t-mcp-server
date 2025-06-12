import express from 'express';
import cors from 'cors';
import { getContextChunks } from './context.js';
import { buildPrompt } from './prompt.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`✅ E12T MCP server listening at http://localhost:${port}`);
});
