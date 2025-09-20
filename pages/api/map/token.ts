import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Server-side Mapbox token serving to avoid client-side exposure
    const mapboxToken = process.env.MAPBOX_TOKEN;

    if (!mapboxToken) {
      return res.status(500).json({ error: 'Mapbox token not configured' });
    }

    res.status(200).json({
      token: mapboxToken,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
  } catch (error) {
    console.error('Map token error:', error);
    res.status(500).json({ error: 'Failed to get map token' });
  }
}
