export function buildPrompt(chunks, question) {
    const context = chunks
        .map((c, i) => `### Source ${i + 1} (${c.url}):\n${c.chunk}`)
        .join('\n\n');

    return `
Tu es un assistant spécialiste d'Angular. Tu comprends le français, mais les sources suivantes sont en anglais.

Utilise uniquement ces sources pour répondre à la question en français.

${context}

---

Question : ${question}
Réponse :
`;
}
