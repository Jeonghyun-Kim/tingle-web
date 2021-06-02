import { ObjectId } from 'bson';

export default function compareId(
  a: string | ObjectId,
  b: string | ObjectId,
): boolean {
  return String(a) === String(b);
}
