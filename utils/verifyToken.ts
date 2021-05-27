import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'bson';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET.');

interface TokenPayload {
  userId: ObjectId;
  email: string;
}

const verifyToken: (
  req: NextApiRequest,
  res: NextApiResponse,
) => TokenPayload = (req, res) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    res.status(401);
    throw new Error('No accessToken.');
  }

  try {
    const { userId, email } = jwt.verify(accessToken, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    return { userId: new ObjectId(userId), email };
  } catch (err) {
    res.status(401);

    if (err.name === 'TokenExpiredError') {
      throw new Error('Token Expired.');
    }

    throw new Error('Invalid accessToken.');
  }
};

export default verifyToken;
