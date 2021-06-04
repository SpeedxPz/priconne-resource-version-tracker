import koaRouter from 'koa-router';


export default async (ctx: koaRouter.IRouterContext, next: Function) => {
  await next();

  const status = ctx.status || 404
  if (status == 404) {
    ctx.throw({
      success: false,
      data: null,
      error: {
        message: 'not found'
      }
    },404);
  }
};