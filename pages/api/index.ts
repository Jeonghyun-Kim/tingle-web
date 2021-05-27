import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      return res.json({ status: 'ok' });
    }

    return res.status(400).send('Method not exists.');
  } catch (err) {
    return res.status(res.statusCode || 500).send(err.message);
  }
};

export default handler;
