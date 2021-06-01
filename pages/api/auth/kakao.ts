import { NextApiRequest, NextApiResponse } from 'next';

const client_id = process.env.KAKAO_REST_API_KEY;
if (!client_id) throw new Error('Missing KAKAO_REST_API_KEY.');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const redirect_uri =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api/oauth/kakao'
        : 'https://travel.tingle.world/api/oauth/kakao';

    res.redirect(
      `https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`,
    );
    return;
  }

  return res.status(400).end();
};

export default handler;
