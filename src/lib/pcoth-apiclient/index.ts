import axios from 'axios';
import { IPostParams } from '../../model/postParams';
import { CreateParamsHash, MakeMD5 } from '../pcoth-cryptography';



export class PCOTHApiClient {
  baseURL: string
  sessionId: string
  appVersion: string
  resVersion: string
  udid: string
  shortUdid: string
  viewerId: string
  salt: string

  constructor(
    baseURL: string,
    appVersion: string,
    resVersion: string,
    udid: string,
    shortUdid: string,
    viewerId: string,
    salt: string
  ) {
    this.baseURL = baseURL;
    this.appVersion = appVersion;
    this.resVersion = resVersion;
    this.udid = udid;
    this.shortUdid = shortUdid;
    this.viewerId = viewerId;
    this.salt = salt;
  }

  async Call(endpoint: string, postParams: IPostParams): Promise<any> {
    return new Promise(async (resolve: Function, reject: Function) => {

      const fullEndpoint: string = `${this.baseURL}/${endpoint}?format=json`;

      const headers = this.GetDefaultHeaders();
      headers['UDID'] = this.udid;
      headers['SID'] = (this.sessionId=='')? MakeMD5(this.viewerId + this.udid, this.salt):MakeMD5(this.sessionId, this.salt);
      headers['PARAM'] = CreateParamsHash(this.udid, this.viewerId, fullEndpoint, postParams);
      headers['SHORT-UDID'] = this.shortUdid;
      headers['APP-VER'] = this.appVersion;
      headers['RES-VER'] = this.resVersion;

      try {
        const res = await axios.post(fullEndpoint, postParams, {
          headers: headers
        });

        if('sid' in res.data.data_headers && res.data.data_headers.sid != "") {
          this.sessionId = res.data.data_headers.sid;
        }

        if('required_res_ver' in  res.data.data_headers){
          this.resVersion = res.data.data_headers.required_res_ver;
        }
        resolve(res.data);
      } catch (err) {
        reject(err);
      }
    });
  }

  GetDefaultHeaders(): any{
    return {
      'User-Agent': 'Dalvik/2.1.0 (Linux; Android 5.1.1; SOV32 Build/32.0.D.0.282; wv)',
      'X-Unity-Version': '2018.4.22f1',
      'Content-Type': 'application/x-www-form-urlencoded',
      //Game Header
      'DEVICE': '2',
      'DEVICE-ID': 'ad8a8ea1422cf6f46faa846cc2ecd220',
      'DEVICE-NAME': 'Sony E6528',
      'GRAPHICS-DEVICE-NAME': 'Mali-T820',
      'PLATFORM-OS-VERSION': 'Android OS 5.1 / API-22 (29.1.A.0.101/418366884)',
      'CARRIER': 'CARRIER',
      'PLATFORM': '2',
      'LOCALE': 'Eng',
      'BATTLE-LOGIC-VERSION': '4',
      'KEYCHAIN': '',
      'BUNDLE-VER': '',
    };
  }
}

