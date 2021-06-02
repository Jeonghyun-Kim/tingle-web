import { ObjectId } from 'bson';
import { User, UserBSON } from './user';

export const AREA_VARIANTS = ['서울', '부산', '제주'] as const;
export type TingleArea = typeof AREA_VARIANTS[number];

export const TRAVEL_PUBLICITY = ['public', 'private', 'archived'] as const;
export const TRAVEL_STATUS = ['open', 'planned', 'closed'] as const;

/**
 * @property {string} dateString - ex. 20210101
 * @property {boolean} withTime
 * @property {string | null} time - string when withTime is true, null otherwise. ex. 2330
 */
export type TingleDate = {
  dateString: string;
} & (
  | {
      withTime: true;
      time: string;
    }
  | {
      withTime: false;
      time: null;
    }
);

export interface TingleLocation {
  area: TingleArea;
  date: TingleDate;
}

interface TravelMember {
  _id: string;
  name: string;
  joined: string;
  exited: string | null;
}

export interface TravelMemberBSON
  extends Omit<TravelMember, '_id' | 'joined' | 'exited'> {
  _id: ObjectId;
  joined: Date;
  exited: Date | null;
}

export interface TravelInput {
  title: string;
  publicity: typeof TRAVEL_PUBLICITY[number];
  status: typeof TRAVEL_STATUS[number];
  departure: TingleLocation;
  arrival: TingleLocation;
}

export interface Travel extends TravelInput {
  _id: string;
  creater: Pick<User, '_id' | 'name' | 'profile'>;
  members: TravelMember[];
  created: string;
}

export interface TravelBSON
  extends Omit<Travel, '_id' | 'creater' | 'members' | 'created'> {
  _id: ObjectId;
  creater: Pick<UserBSON, '_id' | 'name' | 'profile'>;
  members: TravelMemberBSON[];
  created: Date;
  lastUpdated: Date | null;
  deleted: Date | null;
}

export const travelScopes = {
  default: {
    lastUpdated: 0,
    deleted: 0,
  },
  simplified: {
    _id: 1,
    title: 1,
    status: 1,
    creater: 1,
    departure: 1,
    arrival: 1,
    created: 1,
  },
} as const;

export type SimplifiedTravel = Pick<
  Travel,
  keyof typeof travelScopes.simplified
> & {
  membersCount: number;
};

export {};
