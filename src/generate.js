import fetch from 'node-fetch';

const OPENAI_KEY = process.env.OPENAI_API_KEY; // à placer dans Vercel env
const PROVIDER = process.env.LLM_PROVIDER || 'openai'; // 'openai' ou 'groq'

export async function generateFromPrompt(prompt) {
    if (PROVIDER === 'groq') {
        return generateWithGroq(prompt);
    }
    return generateWithOpenAI(prompt);
}

async function generateWithOpenAI(prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Tu es un expert Angular.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.4,
        }),
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? 'Erreur : aucune réponse générée.';
}

async function generateWithGroq(prompt) {
    const GROQ_KEY = process.env.GROQ_API_KEY;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
                { role: 'system', content: 'Tu es un expert Angular.' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.4,
        }),
    });

    const data = await res.json();
    console.log('📦 Groq response:', JSON.stringify(data, null, 2));
    return data?.choices?.[0]?.message?.content ?? 'Erreur : aucune réponse Groq.';
}
