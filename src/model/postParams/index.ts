export interface IPostParams {
  viewer_id: string
}

export class PostParams implements IPostParams {
  viewer_id: IPostParams['viewer_id']

  constructor();
  constructor(params: IPostParams);
  constructor(params?: IPostParams) {
    if(params) Object.assign(this, params);
  }
}