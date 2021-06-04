
import * as mongoose from 'mongoose';
import { ConnectorType } from '../ConnectorType';

export const ProfileSchema: mongoose.Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true},
  type: { type: String, required: true},
  settings: {
    appId: { type: String, required: true},
    apis: { type: String, required: true},
    serverCode: { type: String, required: true},
    credential: {
      udid: { type: String, required: false},
      shortUdid: { type: Number, required: false},
      viewerId: { type: Number, required: false},
      salt: { type: String, required: false},
    },
    guessConfig: {
      defaultResVersion: { type: String, required: false},
      locale: { type: String, required: false},
    }
  }
});


export interface IProfile extends mongoose.Document {
  name: string;
  type: ConnectorType;
  settings: IProfileSettings;
};

export interface IProfileSettings {
  appId: string;
  apis: string;
  serverCode: string;
  credential: ICredential;
  guessConfig: IGuessConfig;
}

export interface IGuessConfig {
  defaultResVersion: string;
  locale: string;
}

export interface ICredential {
  udid: string;
  shortUdid: string;
  viewerId: string;
  salt: string;
}

export const ProfileModel: mongoose.Model<IProfile> = mongoose.model<IProfile>('profile', ProfileSchema);