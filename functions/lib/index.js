"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dexSpecies = exports.dex = exports.mapToken = exports.vouchers = exports.analyze = exports.hello = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// Hello API endpoint
exports.hello = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    res.status(200).json({ name: "John Doe" });
});
// Analyze API endpoint
exports.analyze = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { image, wasteType } = req.body;
        if (!image) {
            res.status(400).json({ error: 'Image data is required' });
            return;
        }
        // Server-side OpenAI integration to avoid client-side API key exposure
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            res.status(500).json({ error: 'OpenAI API key not configured' });
            return;
        }
        // For demo purposes, return mock analysis
        // In production, this would call OpenAI Vision API
        const mockAnalysis = {
            wasteType: wasteType || 'plastic',
            confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
            estimatedWeight: Math.floor(Math.random() * 500) + 100, // 100-600g
            description: `Analyzed waste material: ${wasteType || 'plastic'} container`,
            recyclable: true,
            category: wasteType || 'plastic'
        };
        res.status(200).json({
            success: true,
            analysis: mockAnalysis,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});
// Vouchers API endpoint
exports.vouchers = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Mock vouchers data
    const mockVouchers = [
        {
            id: 1,
            title: "Eco Store Discount",
            description: "20% off on eco-friendly products",
            discount: "20%",
            pointsRequired: 100,
            validUntil: "2024-12-31",
            category: "shopping"
        },
        {
            id: 2,
            title: "Green Restaurant",
            description: "Free organic smoothie",
            discount: "100%",
            pointsRequired: 50,
            validUntil: "2024-12-31",
            category: "food"
        }
    ];
    res.status(200).json({
        success: true,
        vouchers: mockVouchers
    });
});
// Map token API endpoint
exports.mapToken = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
        res.status(500).json({ error: 'Mapbox token not configured' });
        return;
    }
    res.status(200).json({
        success: true,
        token: mapboxToken
    });
});
// Dex API endpoint
exports.dex = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Mock DEX data - in production, this would come from a database
    const mockDexData = {
        species: [
            {
                speciesId: 'plastic_eater',
                name: 'Plastic Eater',
                category: 'plastic',
                description: 'A creature that consumes plastic waste',
                forms: [
                    {
                        formId: 'plastic_eater_1',
                        name: 'Basic Form',
                        rarity: 'common',
                        imageUrl: '/assets/Plastic/Plastic-Plastivore-1.png'
                    }
                ]
            }
        ],
        progress: {
            ownedFormIds: [
                'plastic_eater_1',
                'metal_crusher_1',
                'glass_breaker_1'
            ]
        },
        totals: {
            owned: 3,
            total: 10,
            ownedSpecies: 3,
            totalSpecies: 5
        }
    };
    res.status(200).json(mockDexData);
});
// Dex species API endpoint
exports.dexSpecies = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const speciesId = req.query.speciesId;
    if (!speciesId) {
        res.status(400).json({ error: 'Species ID is required' });
        return;
    }
    // Mock species data
    const mockSpecies = {
        speciesId: speciesId,
        name: 'Plastic Eater',
        category: 'plastic',
        description: 'A creature that consumes plastic waste',
        forms: [
            {
                formId: 'plastic_eater_1',
                name: 'Basic Form',
                rarity: 'common',
                imageUrl: '/assets/Plastic/Plastic-Plastivore-1.png'
            }
        ],
        ownedForms: ['plastic_eater_1'],
        ownedCount: 1,
        totalForms: 1
    };
    res.status(200).json(mockSpecies);
});
//# sourceMappingURL=index.js.map