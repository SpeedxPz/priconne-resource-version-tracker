
import * as mongoose from 'mongoose';

export const VersionSchema: mongoose.Schema = new mongoose.Schema({
  appId: { type: String, required: true, unique: true},
  serverCode: { type: String, required: true, unique: true},
  appVersion: { type: String, required: false},
  resVersion: { type: String, required: false},
  createDate: { type: Number, required: true},
  updateDate: { type: Number, required: true},
});


export interface IVersion extends mongoose.Document {
  appId: string;
  serverCode: string;
  appVersion: string;
  resVersion: string;
  createDate: number;
  updateDate: number;
};


export const VersionModel: mongoose.Model<IVersion> = mongoose.model<IVersion>('version', VersionSchema);