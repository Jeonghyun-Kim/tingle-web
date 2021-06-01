import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { isValidEmail } from '@utils/validator/email';
import { isValidPassword } from '@utils/validator/password';
import connectMongo from '@utils/connectMongo';

const BCRYPT_SALT = 10 as const;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const exUser = await db.collection('user').findOne({ email });
    if (exUser) {
      return res
        .status(400)
        .json({ code: 'A03', message: 'Already signed up.' });
    }

    const refreshToken = v4();

    const { insertedId } = await db.collection('user').insertOne({
      email,
      password: await bcrypt.hash(password, BCRYPT_SALT),
      refreshToken,
      created: new Date(),
      signinHistory: [{ at: new Date() }],
    });

    const accessToken = jwt.sign(
      { userId: String(insertedId), email },
      JWT_SECRET,
      {
        expiresIn: '10m',
      },
    );

    return res.status(201).json({ accessToken, refreshToken });
  }

  return res.status(400).end();
};

export default handler;
