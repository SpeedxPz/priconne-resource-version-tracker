import koaRouter = require('koa-router')
import { LibrdKafkaError, Metadata } from 'node-rdkafka';
import { scheduleConsumer, versionEventProducer } from '../../../../lib/kafka';

export const router = new koaRouter();


const getScheduleMetadata = async(): Promise<boolean> => {
  return new Promise((resolve: Function, reject: Function) => {
    scheduleConsumer.getMetadata({}, (err: LibrdKafkaError, _0: Metadata) => {
      if(err) return reject(err);
      resolve(true);
    });
  });
}

const getVersionEventMetadata = async(): Promise<boolean> => {
  return new Promise((resolve: Function, reject: Function) => {
    versionEventProducer.getMetadata({}, (err: LibrdKafkaError, _0: Metadata) => {
      if(err) return reject(err);
      resolve(true);
    });
  });
}

router.get('/_health', async(_1: koaRouter.IRouterContext) => {

  await getScheduleMetadata();
  await getVersionEventMetadata();

  return {
    status: 'ok'
  };
});

