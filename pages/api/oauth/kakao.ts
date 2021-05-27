import connectMongo from '@utils/connectMongo';
import isString from '@utils/validator/isString';
import { NextApiRequest, NextApiResponse } from 'next';
import qs from 'qs';
import { v4 as uuidv4 } from 'uuid';

const client_id = process.env.KAKAO_REST_API_KEY;
if (!client_id) throw new Error('Missing KAKAO_REST_API_KEY.');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { code } = req.query;

      if (!code || !isString(code)) return res.status(400).end();

      const redirect_uri =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/api/oauth/kakao'
          : 'https://travel.tingle.world/api/oauth/kakao';

      // get kakao access_token
      const response = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: qs.stringify({
          grant_type: 'authorization_code',
          client_id,
          redirect_uri,
          code,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        return res.status(500).send(errorText);
      }

      const kakaoToken = await response.json();

      if (!kakaoToken.access_token)
        return res.status(500).send("Can't find access_token from kakaoToken.");

      // get user info
      const response2 = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${kakaoToken.access_token}`,
        },
      });

      if (!response2.ok) {
        return res.status(500).send(await response2.text());
      }

      const userData = await response2.json();

      // TODO: create new access / refresh tokens

      const { db } = await connectMongo();

      await db.collection('user').updateOne(
        {
          kakaoId: userData.id,
        },
        {
          $set: {
            nickname: userData?.kakao_account?.profile?.nickname ?? uuidv4(),
            userData,
            kakaoToken,
            // refreshToken
          },
        },
        {
          upsert: true,
        },
      );

      // set cookie
      res.redirect('/');
      return;

      return res.json({
        // accessToken,
        // refreshToken,
      });
    }

    return res.status(400).send('Method not exists.');
  } catch (err) {
    return res.status(res.statusCode || 500).send(err.message);
  }
};

export default handler;
