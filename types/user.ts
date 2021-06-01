import { ObjectId } from 'bson';

const GENDER_VARIANTS = ['male', 'female', 'other'] as const;
export type Gender = typeof GENDER_VARIANTS[number];

export interface Profile {
  src: string | null;
  statusText: string;
  lastUpdated: string;
}

export interface ProfileBSON extends Omit<Profile, 'lastUpdated'> {
  lastUpdated: Date;
}

export interface User {
  _id: string;
  name: string;
  birthYear: number;
  gender: Gender;
  profile: Profile;
  created: string;
  lastSignedIn: string;
}

export interface UserBSON
  extends Omit<User, '_id' | 'created' | 'lastSignedIn'> {
  _id: ObjectId;
  created: Date;
  lastSignedIn: Date;
  deleted: Date | null;
}

export {};
