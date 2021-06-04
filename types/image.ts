import { ObjectId } from 'bson';

interface ImageInfo {
  src: string;
  width: number;
  height: number;
}

export interface TinglePicture {
  _id: string;
  ownerId: string;
  images: {
    xs: ImageInfo;
    sm: ImageInfo;
    md: ImageInfo;
    lg: ImageInfo;
    xl: ImageInfo;
  };
  created: string;
}

export interface TinglePictureBSON
  extends Omit<TinglePicture, '_id' | 'ownerId' | 'created'> {
  _id: ObjectId;
  ownerId: ObjectId;
  created: Date;
  deleted: Date | null;
}

export {};
