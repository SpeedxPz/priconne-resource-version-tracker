import axios from 'axios';
import { PCOTHApiClient } from '../../../lib/pcoth-apiclient';
import { IAppInfo } from '../../../model/AppInfo';
import { CheckGameStart, ICheckGameStart } from '../../../model/CheckGameStartParams';
import { IPCOAPIResponse } from '../../../model/PCOAPIResponse';
import { IProfileSettings } from "../../../model/profile";
import { IVersion, VersionModel } from '../../../model/version';
import * as AppVersionService from '../../../repository/appversion';
import { sleep } from '../../../utils/common';


const getOrCreateResVersion = async (appId: string, serverCode: string) : Promise<IVersion> => {
  return new Promise(async (resolve: Function, _1: Function) => {
    const versions: IVersion[] = await VersionModel.find({appId: appId, serverCode: serverCode});

    if(versions.length) {
      return resolve(versions[0]);
    } else {
      const version: IVersion = await VersionModel.create({
        appId: appId,
        serverCode: serverCode,
        appVersion: '',
        resVersion: '',
        createDate: Math.floor(Date.now()),
        updateDate: Math.floor(Date.now()),
      });

      return resolve(version);
    }
  });
};

export interface ICheckUpdateResult {
  isUpdated: boolean;
  appId: string;
  serverCode: string;
  appVersion: string;
  resVersion: string;
  timestamp: number;
}

export const checkUpdateAPIConnector = async (setting: IProfileSettings) : Promise<ICheckUpdateResult> => {
  return new Promise(async (resolve: Function, reject: Function) => {
    const dbVersionInfo: IVersion = await getOrCreateResVersion(setting.appId, setting.serverCode);
    const appInfo: IAppInfo = await AppVersionService.getByAppId(setting.appId);

    dbVersionInfo.appVersion = appInfo.version;
    dbVersionInfo.save();

    const requestParams: ICheckGameStart = new CheckGameStart();
    requestParams.app_type = 0;
    requestParams.campaign_data = "";
    requestParams.campaign_sign = "69fc9ddde974cc75a0756abb16b2ef35";
    requestParams.campaign_user = 157428;

    const apiClient: PCOTHApiClient = new PCOTHApiClient(
      setting.apis,
      appInfo.version,
      '0',
      setting.credential.udid,
      setting.credential.shortUdid,
      setting.credential.viewerId,
      setting.credential.salt,
    );

    const result : IPCOAPIResponse = await apiClient.Call('check/game_start', requestParams);

    if(result.data_headers.result_code != 1) {
      return reject(`Error result code is ${result.data.result_code}`);
    }

    if(!result.data_headers.required_res_ver) {
      return reject("Missing required_res_ver property");
    }

    if(result.data_headers.required_res_ver != dbVersionInfo.resVersion) {
      dbVersionInfo.resVersion = result.data_headers.required_res_ver;
      dbVersionInfo.updateDate = Math.floor(Date.now());
      dbVersionInfo.save();
      return resolve({
        isUpdated: true,
        appId: dbVersionInfo.appId,
        serverCode: dbVersionInfo.serverCode,
        appVersion: dbVersionInfo.appVersion,
        resVersion: dbVersionInfo.resVersion,
        timestamp: dbVersionInfo.updateDate,
      });
    }

    return resolve({
      isUpdated: false,
      appId: dbVersionInfo.appId,
      serverCode: dbVersionInfo.serverCode,
      appVersion: dbVersionInfo.appVersion,
      resVersion: dbVersionInfo.resVersion,
      timestamp: dbVersionInfo.updateDate,
    });
  });
};

export const checkUpdateGuessConnector = async (setting: IProfileSettings) : Promise<ICheckUpdateResult> => {
  return new Promise(async (resolve: Function, reject: Function) => {
    const dbVersionInfo: IVersion = await getOrCreateResVersion(setting.appId, setting.serverCode);
    const appInfo: IAppInfo = await AppVersionService.getByAppId(setting.appId);

    dbVersionInfo.appVersion = appInfo.version;
    dbVersionInfo.save();

    let initialGuessVersion: number = (dbVersionInfo.resVersion)?parseInt(dbVersionInfo.resVersion):parseInt(setting.guessConfig.defaultResVersion);

    if(!setting.guessConfig.defaultResVersion || !setting.guessConfig.locale) {
      return reject("Missing required guess config");
    }

    let newVersion: string = "";

    for(let lap: number = 1; lap <= 20; lap++) {
      const guessNumber: number = initialGuessVersion + (lap * 10);
      try {
        await axios.get(
          `${setting.apis}/dl/Resources/${guessNumber}/${setting.guessConfig.locale}/AssetBundles/Android/manifest/manifest_assetmanifest`,
          {
            transformResponse: (data) => data
          }
        );
        newVersion = guessNumber.toString();
      } catch (error) {
      }
      await sleep(1000);
    }

    if(newVersion) {
      dbVersionInfo.resVersion = newVersion
      dbVersionInfo.updateDate = Math.floor(Date.now());
      dbVersionInfo.save();
      return resolve({
        isUpdated: true,
        appId: dbVersionInfo.appId,
        serverCode: dbVersionInfo.serverCode,
        appVersion: dbVersionInfo.appVersion,
        resVersion: dbVersionInfo.resVersion,
        timestamp: dbVersionInfo.updateDate,
      });
    }

    return resolve({
      isUpdated: false,
      appId: dbVersionInfo.appId,
      serverCode: dbVersionInfo.serverCode,
      appVersion: dbVersionInfo.appVersion,
      resVersion: dbVersionInfo.resVersion,
      timestamp: dbVersionInfo.updateDate,
    });
  });
};