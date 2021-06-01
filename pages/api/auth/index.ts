import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'bson';

import { isValidEmail } from '@utils/validator/email';
import { isValidPassword } from '@utils/validator/password';
import connectMongo from '@utils/connectMongo';
import verifyToken from '@utils/verifyToken';
import withErrorHandler from '@utils/withErrorHandler';
import { UserBSON, userScopes } from 'types/user';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await verifyToken(req, res);

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
      return res.status(400).json({ code: 'A02', message: err.message });
    }

    const { db } = await connectMongo();

    const exUser = (await db
      .collection<UserBSON>('user')
      .findOne({ email }, { projection: userScopes.passwordOnly })) as Pick<
      UserBSON,
      keyof typeof userScopes.passwordOnly
    >;
    if (!exUser) {
      return res.status(404).json({ code: 'A04', message: 'No such user.' });
    }

    if (!(await bcrypt.compare(password, exUser.password))) {
      return res.status(401).json({ code: 'A05', message: 'Password wrong.' });
    }

    await db.collection<UserBSON>('user').updateOne(
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

  if (req.method === 'PUT') {
    const { refreshToken } = req.body;
    const accessToken = req.headers.authorization;

    if (!accessToken || !refreshToken)
      return res.status(400).json({
        code: 'A01',
        message: 'Missing accessToken or refreshToken.',
      });

    let userInfo: { userId: string; email: string };

    try {
      userInfo = jwt.verify(accessToken, JWT_SECRET, {
        ignoreExpiration: true,
      }) as { userId: string; email: string };
    } catch (err) {
      res.status(401);
      throw new Error('Invalid accessToken.');
    }

    const { db } = await connectMongo();

    const user = (await db.collection<UserBSON>('user').findOne(
      {
        _id: new ObjectId(userInfo.userId),
      },
      {
        projection: userScopes.forRefresh,
      },
    )) as Pick<UserBSON, keyof typeof userScopes.forRefresh>;

    if (!user) {
      return res.status(404).json({ code: 'A04', message: 'No such user.' });
    }

    // await db.collection<UserBSON>('user').updateOne(
    //   {
    //     _id: user._id,
    //   },
    //   {
    //     $push: {
    //       signinHistory: { at: new Date() },
    //     },
    //   },
    // );

    const newAccessToken = jwt.sign(
      { userId: String(user._id), email: user.email },
      JWT_SECRET,
      {
        expiresIn: '10m',
      },
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: user.refreshToken,
    });
  }

  return res.status(400).end();
};

export default withErrorHandler(handler);
