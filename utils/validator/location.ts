import { TravelLocation } from 'types/travel';
import isString from './isString';

export default function isValidLocation(val: any): val is TravelLocation {
  const { from, to } = val;

  if (!from || !to) return false;
  if (!isString(from) || !isString(to)) return false;

  return true;
}
