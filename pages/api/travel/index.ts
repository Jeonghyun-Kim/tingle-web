import { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandler from '@utils/withErrorHandler';
import verifyToken from '@utils/verifyToken';
import connectMongo from '@utils/connectMongo';
import isValidTravel from '@utils/validator/travel/isValidTravel';

// types
import { TravelBSON, travelScopes } from 'types/travel';
import { UserBSON, userScopes } from 'types/user';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { db } = await connectMongo();

    const travels = await db
      .collection<TravelBSON>('travel')
      .aggregate([
        {
          $match: {
            publicity: 'public',
            deleted: null,
          },
        },
        {
          $sort: {
            created: -1,
          },
        },
        {
          $project: {
            ...travelScopes.simplified,
            membersCount: {
              $size: '$members',
            },
            picturesCount: {
              $size: '$pictures',
            },
          },
        },
        {
          $limit: 30,
        },
      ])
      .toArray();

    return res.json({ travels });
  }

  if (req.method === 'POST') {
    const { userId } = await verifyToken(req, res);

    const travelInput = req.body;

    // TODO: detailed validation?
    if (!isValidTravel(travelInput)) {
      return res
        .status(400)
        .json({ code: 'A02', message: 'validation failed. check types' });
    }

    const { title, publicity, status, departure, arrival } = travelInput;

    const { db } = await connectMongo();

    const user = (await db.collection<UserBSON>('user').findOne(
      { _id: userId },
      {
        projection: userScopes.forProfile,
      },
    )) as Pick<UserBSON, keyof typeof userScopes.forProfile>;

    if (!user) throw new Error('Cannot find user info.');

    const now = new Date();

    const { insertedId } = await db.collection<TravelBSON>('travel').insertOne({
      title,
      publicity,
      status,
      departure,
      arrival,
      creater: user,
      members: [
        {
          _id: user._id,
          name: user.name,
          joined: now,
          exited: null,
        },
      ],
      pictures: [],
      created: now,
      lastUpdated: null,
      deleted: null,
    });

    return res.status(201).json({ travelId: insertedId });
  }

  return res.status(400).end();
};

export default withErrorHandler(handler);
