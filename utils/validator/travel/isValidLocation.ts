import isDecimal from 'validator/lib/isDecimal';

import isOneOf from '../isOneOf';

// types
import { AREA_VARIANTS, TingleDate, TingleLocation } from 'types/travel';
import isString from '../isString';

export function isValidTingleDate(date: any): date is TingleDate {
  const { dateString, withTime, time } = date;

  if (!isDecimal(dateString)) return false;
  if (!isString(dateString, { minLength: 8, maxLength: 8 })) return false;
  // TODO: need more precise validations

  if (typeof withTime !== 'boolean') return false;
  if (withTime) {
    if (!isDecimal(time)) return false;
    if (!isString(time, { minLength: 4, maxLength: 4 })) return false;
  } else {
    if (time !== null) return false;
  }

  return true;
}

export default function isValidLocation(
  location: any,
): location is TingleLocation {
  const { area, date } = location;

  if (!isOneOf(area, AREA_VARIANTS)) return false;
  if (!isValidTingleDate(date)) return false;

  return true;
}
