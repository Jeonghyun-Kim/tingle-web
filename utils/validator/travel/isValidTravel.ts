import isOneOf from '../isOneOf';
import isString from '../isString';

// types
import { TravelInput, TRAVEL_PUBLICITY, TRAVEL_STATUS } from 'types/travel';
import isValidLocation from './isValidLocation';

export default function isValidTravel(travel: any): travel is TravelInput {
  const { title, publicity, status, departure, arrival } = travel;

  if (!isString(title, { minLength: 1, maxLength: 100 })) return false;
  if (!isOneOf(publicity, TRAVEL_PUBLICITY)) return false;
  if (!isOneOf(status, TRAVEL_STATUS)) return false;
  if (!isValidLocation(departure)) return false;
  if (!isString(arrival, { minLength: 1, maxLength: 15 })) return false;

  return true;
}
