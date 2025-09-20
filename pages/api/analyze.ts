import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, wasteType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Server-side OpenAI integration to avoid client-side API key exposure
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
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

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
}
