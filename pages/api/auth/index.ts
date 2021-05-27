import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'bson';

import { isValidEmail } from '@utils/validator/email';
import { isValidPassword } from '@utils/validator/password';
import connectMongo from '@utils/connectMongo';
import verifyToken from '@utils/verifyToken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      verifyToken(req, res);

      return res.status(204).end();
    }

    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ code: 'A01', message: 'Missing email or password.' });
      }

      try {
        isValidEmail(email);
        isValidPassword(password);
      } catch (err) {
        return res.status(400).json({ code: 'A02', messsage: err.message });
      }

      const { db } = await connectMongo();

      const exUser = await db
        .collection<{
          _id: ObjectId;
          email: string;
          password: string;
          refreshToken: string;
        }>('user')
        .findOne({ email });
      if (!exUser) {
        return res.status(404).json({ code: 'A04', message: 'No such user.' });
      }

      if (!(await bcrypt.compare(password, exUser.password))) {
        return res
          .status(401)
          .json({ code: 'A05', message: 'Password wrong.' });
      }

      await db.collection('user').updateOne(
        {
          _id: exUser._id,
        },
        {
          $push: {
            signinHistory: { at: new Date() },
          },
        },
      );

      const accessToken = jwt.sign(
        { userId: String(exUser._id), email },
        JWT_SECRET,
        {
          expiresIn: '10m',
        },
      );

      return res
        .status(201)
        .json({ accessToken, refreshToken: exUser.refreshToken });
    }

    return res.status(400).send('Method not exists.');
  } catch (err) {
    return res
      .status(res.statusCode || 500)
      .json({ code: 'E00', message: err.message });
  }
};

export default handler;
