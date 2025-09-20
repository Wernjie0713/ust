import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voucherCode, userId } = req.body;

    if (!voucherCode || !userId) {
      return res.status(400).json({ error: 'Voucher code and user ID are required' });
    }

    // Mock voucher redemption logic
    // In production, this would validate against a database
    const validVouchers = [
      'ECOGO2024',
      'RECYCLE50',
      'GREEN25',
      'ECOBOOST'
    ];

    if (!validVouchers.includes(voucherCode.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid voucher code' });
    }

    // Mock voucher redemption response
    const voucherRewards = {
      ecoPoints: 100,
      ecoTokens: 10,
      description: `${voucherCode} voucher redeemed successfully!`
    };

    res.status(200).json({
      success: true,
      redeemed: true,
      rewards: voucherRewards,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Voucher redemption error:', error);
    res.status(500).json({ error: 'Failed to redeem voucher' });
  }
}
