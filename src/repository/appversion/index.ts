import axios, { AxiosResponse } from 'axios';
import * as config from '../../config';
import { IAppInfo } from '../../model/AppInfo';


export const getByAppId = async (appId: string) : Promise<IAppInfo> => {
  return new Promise(async (resolve: Function, reject: Function) => {
    try {
      const result: AxiosResponse = await axios.get(
        `${config.app.services.appVersion.baseURL}/v1/version/android/${appId}`
      );

      if(result.status != 200){
        throw new Error(result.data);
      }

      if(result.data.error){
        throw new Error(result.data.error);
      }

      const appInfo: IAppInfo = result.data.data.result;
      return resolve(appInfo);

    } catch (error) {
      return reject(error);
    }
  });
}