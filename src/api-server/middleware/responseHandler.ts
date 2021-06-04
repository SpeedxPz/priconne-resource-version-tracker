import koaRouter from 'koa-router';

export default async (ctx: koaRouter.IRouterContext, next: Function) => {
  const data = await next();

  if(data)
  {
    ctx.body = {
      success: true,
      data,
      error: null
    };
  }

};