import koaRouter = require('koa-router')

export const router = new koaRouter();


router.get('/_health', async(_1: koaRouter.IRouterContext) => {

  return {
    status: 'ok'
  };
});

