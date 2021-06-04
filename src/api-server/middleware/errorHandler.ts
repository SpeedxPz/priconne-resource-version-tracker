import koaRouter from 'koa-router';


export default async (ctx: koaRouter.IRouterContext, next: Function) => {

  try{
    await next();
  } catch ( { isCustomError, statusCode, code, message, stack } ) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      data: null,
      error: {
        code,
        message
      }
    }
  }

};