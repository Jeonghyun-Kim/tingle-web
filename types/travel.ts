import { ObjectId } from 'bson';

export interface TravelLocation {
  from: string;
  to: string;
}

export interface TravelInfo {
  _id: ObjectId;
  departAt: string;
  name: string;
  location: TravelLocation;
  created: Date;
  deleted: Date | null;
}

export interface TravelInputs {
  departAt: string;
  name: string;
  location: TravelLocation;
}

export const initialTravelInputs: TravelInputs = {
  departAt: '',
  name: '',
  location: {
    from: '',
    to: '',
  },
};

export {};
