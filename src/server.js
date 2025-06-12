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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée.' });
    }

    try {
        const { q } = req.body;

        if (!q) return res.status(400).json({ error: 'Question manquante.' });

        const { blocked, question: cleanQuestion, reason } = sanitizeQuestion(q);
        if (blocked) return res.json({ answer: `⚠️ ${reason}` });

        const chunks = getContextChunks(cleanQuestion);
        const prompt = buildPrompt(chunks, cleanQuestion);
        const answer = await generateFromPrompt(prompt);

        return res.json({ answer });
    } catch (e) {
        console.error('[MCP] Erreur :', e);
        return res.status(500).json({ error: 'Erreur serveur MCP' });
    }
}
