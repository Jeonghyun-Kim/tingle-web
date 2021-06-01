import { NextApiResponse } from 'next';

export default function withErrorHandler<T extends any>(
  handler: (req: T, res: NextApiResponse) => void | Promise<void>,
): (req: T, res: NextApiResponse) => Promise<void> {
  return async (req: T, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('uncaught error!');
      console.error(err);

      return res
        .status(res.statusCode || 500)
        .json({ code: 'E00', message: err.message });
    }
  };
}
