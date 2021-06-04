
import * as crypto from 'crypto'
import * as md5 from 'md5'
import * as msgpack from 'msgpack'
import { IPostParams } from '../../model/postParams'

export const MakeMD5 = (input: string, salt: string): string => {
  return md5(input + salt)
}

export const MakeSHA1 = (input: string): any => {
  const shasum = crypto.createHash('sha1')
  shasum.update(input);
  return shasum.digest('hex');
}

export const CreateParamsHash = (udid: string, viewerId: string, url: string, params: IPostParams): string => {
  params.viewer_id = viewerId;
  const encodedParams = msgpack.pack(params).toString('base64');

  const pathName: string = new URL(url).pathname;
  let dataToHash: string = `${udid}${pathName}${encodedParams}`;

  if(viewerId != '') {
    dataToHash += `${viewerId}`;
  }


  return MakeSHA1(dataToHash);
}