import koaRouter = require('koa-router')
import * as systemRouter from './system';
import * as versionRouter from './version';

export const router = new koaRouter();

router.use(
  '/version',
  versionRouter.router.routes(),
  versionRouter.router.allowedMethods()
);

router.use(
  '/system',
  systemRouter.router.routes(),
  systemRouter.router.allowedMethods()
);