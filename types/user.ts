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
  email: string;
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
  password: string;
  refreshToken: string;
  created: Date;
  lastSignedIn: Date;
  deleted: Date | null;
}

export const userScopes = {
  passwordOnly: {
    _id: 1,
    password: 1,
    refreshToken: 1,
  },
  emailOnly: {
    _id: 1,
    email: 1,
  },
  forRefresh: {
    _id: 1,
    email: 1,
    refreshToken: 1,
  },
  forProfile: {
    _id: 1,
    name: 1,
    profile: 1,
  },
  withoutPassword: {
    password: 0,
    deleted: 0,
  },
  withDetails: {
    password: 0,
    refreshToken: 0,
    deleted: 0,
  },
} as const;

export {};
