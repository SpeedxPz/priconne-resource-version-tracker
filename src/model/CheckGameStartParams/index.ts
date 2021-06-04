import { IPostParams, PostParams } from '../postParams';

export interface ICheckGameStart extends IPostParams {
  app_type: number;
  campaign_data: string;
  campaign_sign: string;
  campaign_user: number;
}

export class CheckGameStart extends PostParams implements ICheckGameStart {
  app_type: ICheckGameStart['app_type'];
  campaign_data: ICheckGameStart['campaign_data'];
  campaign_sign: ICheckGameStart['campaign_sign'];
  campaign_user: ICheckGameStart['campaign_user'];

  constructor();
  constructor(params: IPostParams);
  constructor(params?: IPostParams) {
    super(params);
    if(params) Object.assign(this, params);
  }
}