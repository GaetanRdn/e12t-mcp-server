import Fuse from 'fuse.js';

import chunks from '../data/chunks.json' with { type: 'json' };

const fuse = new Fuse(chunks, {
    includeScore: true,
    useExtendedSearch: true,
    ignoreLocation: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    keys: [
        { name: 'chunk', weight: 0.6 },
        { name: 'title', weight: 0.3 },
        { name: 'url', weight: 0.1 }
    ],
});

export function getContextChunks(question, limit = 3) {
    const query = {
        $and: question
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => ({ chunk: word })),
    };

    return fuse.search(query).slice(0, limit).map(r => r.item);
}
