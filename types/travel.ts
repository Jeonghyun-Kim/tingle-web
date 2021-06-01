import { ObjectId } from 'bson';
import { User } from './user';

const AREA_VARIANTS = ['서울', '부산', '제주'] as const;
export type TingleArea = typeof AREA_VARIANTS[number];

const TRAVEL_PUBLICITY = ['public', 'private', 'archived'] as const;
const TRAVEL_STATUS = ['open', 'planned', 'closed'] as const;

type TingleDate = {
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

interface TingleLocation {
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

export type Travel = {
  _id: string;
  name: string;
  title: string;
  publicity: typeof TRAVEL_PUBLICITY[number];
  status: typeof TRAVEL_STATUS[number];
  creater: Pick<User, '_id' | 'name' | 'profile'>;
  members: TravelMember[];
  departure: TingleLocation;
  arrival: TingleLocation;
  created: string;
};

export interface TravelBSON
  extends Omit<Travel, '_id' | 'members' | 'created'> {
  _id: ObjectId;
  members: TravelMemberBSON;
  created: Date;
}

export {};
