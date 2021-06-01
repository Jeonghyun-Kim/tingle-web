import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandler from '@utils/withErrorHandler';
import verifyToken from '@utils/verifyToken';
import connectMongo from '@utils/connectMongo';

// types
import { UserBSON, userScopes } from 'types/user';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { userId } = await verifyToken(req, res);

    const { db } = await connectMongo();

    const user = (await db
      .collection<UserBSON>('user')
      .findOne(
        { _id: userId, deleted: null },
        { projection: userScopes.withDetails },
      )) as Omit<UserBSON, keyof typeof userScopes.withDetails>;

    if (user === null) {
      throw new Error('Deleted user.');
    }

    return res.json(user);
  }

  return res.status(400).end();
};

export default withErrorHandler(handler);
