import { IPostParams, PostParams } from '../postParams';

export interface ICheckAgreementParams extends IPostParams {
}

export class CheckAgreementParams extends PostParams implements ICheckAgreementParams {


  constructor();
  constructor(params: IPostParams);
  constructor(params?: IPostParams) {
    super(params);
    if(params) Object.assign(this, params);
  }
}