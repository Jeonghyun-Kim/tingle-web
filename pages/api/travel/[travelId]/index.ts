import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'bson';

import withErrorHandler from '@utils/withErrorHandler';
import verifyToken from '@utils/verifyToken';
import connectMongo from '@utils/connectMongo';

import isValidTravel from '@utils/validator/travel/isValidTravel';
import isString from '@utils/validator/isString';
import isOneOf from '@utils/validator/isOneOf';

// types
import { TravelBSON, travelScopes } from 'types/travel';
import compareId from '@utils/compareId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { travelId } = req.query;
  if (!isString(travelId)) {
    return res.status(400).json({ code: 'A02', message: 'Invalid travelId.' });
  }

  const { db } = await connectMongo();

  const travel = (await db
    .collection<TravelBSON>('travel')
    .findOne(
      { _id: new ObjectId(travelId), deleted: null },
      { projection: travelScopes.default },
    )) as Omit<TravelBSON, 'lastUpdated' | 'deleted'>;

  if (travel === null)
    return res.status(404).json({ code: 'T01', message: 'No such travel.' });

  if (req.method === 'GET') {
    // check publicity
    if (travel.publicity !== 'public') {
      const { userId } = await verifyToken(req, res);
      if (
        !isOneOf(
          userId,
          travel.members.map(({ _id }) => _id),
        )
      ) {
        return res
          .status(403)
          .json({ code: 'A04', message: 'Not a permitted member.' });
      }
    }

    return res.json({ travel });
  }

  if (req.method === 'PUT') {
    const travelInput = req.body;

    if (!isValidTravel(travelInput)) {
      return res
        .status(400)
        .json({ code: 'A02', message: 'Validation failed.' });
    }

    const { userId } = await verifyToken(req, res);

    if (!compareId(userId, travel.creater._id)) {
      return res.status(403).json({ code: 'A04', message: 'No permission.' });
    }

    const { title, publicity, status, departure, arrival } = travelInput;

    const { db } = await connectMongo();

    await db.collection<TravelBSON>('travel').updateOne(
      { _id: travel._id },
      {
        $set: {
          title,
          publicity,
          status,
          departure,
          arrival,
          lastUpdated: new Date(),
        },
      },
    );

    return res.status(204).end();
  }

  if (req.method === 'DELETE') {
    const { userId } = await verifyToken(req, res);

    if (!compareId(userId, travel.creater._id)) {
      return res.status(403).json({ code: 'A04', message: 'No permission.' });
    }

    await db.collection<TravelBSON>('travel').updateOne(
      {
        _id: travel._id,
      },
      {
        $set: {
          deleted: new Date(),
        },
      },
    );

    return res.status(204).end();
  }

  return res.status(400).end();
};

export default withErrorHandler(handler);
