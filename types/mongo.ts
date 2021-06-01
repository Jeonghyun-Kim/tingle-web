import { ObjectId } from 'bson';

export type WithId<T> = T & { _id: ObjectId };
