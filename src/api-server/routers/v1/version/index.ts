import koaRouter = require('koa-router')
import { IResourceVersionEvent } from '../../../../model/ResourceVersionEvent';
import { IVersion, VersionModel } from '../../../../model/version';

export const router = new koaRouter();


router.get('/', async(_1: koaRouter.IRouterContext) => {
  const versionInfos: IVersion[] = await VersionModel.find({}).lean();

  const results: IResourceVersionEvent[] = versionInfos.map(( (item: IVersion) => {
    return {
      appId: item.appId,
      serverCode: item.serverCode,
      appVersion: item.appVersion,
      resVersion: item.resVersion,
      updateDate: item.updateDate,
    };
  }));

  return {
    results: results,
    count: results.length
  };
});

router.get('/:serverCode', async(ctx: koaRouter.IRouterContext) => {
  const { serverCode } = ctx.params;
  const normserverCode = serverCode.toUpperCase();

  const versionInfo: IVersion = await VersionModel.findOne({serverCode: normserverCode}).lean();

  if(!versionInfo) {
    ctx.throw(404, new Error(`Not found`));
  }

  const result: IResourceVersionEvent = {
    appId: versionInfo.appId,
    serverCode: versionInfo.serverCode,
    appVersion: versionInfo.appVersion,
    resVersion: versionInfo.resVersion,
    updateDate: versionInfo.updateDate,
  };

  return {
    result: result,
  };
});

