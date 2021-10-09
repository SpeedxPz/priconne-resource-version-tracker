import { AdminClient, KafkaConsumer, LibrdKafkaError, Message, Producer } from 'node-rdkafka';
import * as config from '../../config';
import { LogLevel, writeLog } from '../../utils/logger';


export const adminClient = AdminClient.create({
  'bootstrap.servers': config.app.kafka.bootstrap
});

export const scheduleConsumer = new KafkaConsumer(
  {
    'bootstrap.servers': config.app.kafka.bootstrap,
    'enable.auto.commit': false,
    'group.id': config.app.namespace,
  },
  {
    'enable.auto.commit': false,
    "auto.offset.reset": "earliest",
  }
);

export const versionEventProducer = new Producer(
  {
    'compression.type': 'snappy',
    'enable.idempotence': true,
    'retries': 10000000,
    'socket.keepalive.enable': true,
    'bootstrap.servers': config.app.kafka.bootstrap,
  },
  {}
);

export const createTopic = (
  name: string,
  replication: number,
  config?: any,
) : Promise<any> => new Promise( (resolve: Function, reject: Function) => {

  adminClient.createTopic(
    {
      'topic': name,
      'num_partitions': 1,
      'replication_factor': replication,
      'config': {
        'compression.type': 'snappy',
        'retention.ms': '604800000',
        ...config,
      }
    },
    (error: LibrdKafkaError) => {
      if(error) return reject(error);
      else resolve();
    }
  );
});


scheduleConsumer.setDefaultConsumeLoopTimeoutDelay(5);
scheduleConsumer.on('ready', async () => {
  writeLog(LogLevel.INFO, 'event_consumer', `Producer is ready`);
  try {
    await createTopic(
      config.app.kafka.topic.schedule.name,
      parseInt(config.app.kafka.topic.schedule.replication),
      {
        'cleanup.policy': 'compact'
      },
    )
  } catch (error) {} finally {
    scheduleConsumer.subscribe([config.app.kafka.topic.schedule.name]);
  }
});


export const schedulePollMessage = () : Promise<Message[]> =>
  new Promise((resolve: Function, reject: Function) => {
    scheduleConsumer.consume(
      100,
      (error: LibrdKafkaError, messages: Message[]) => {
        if(error) return reject(error)
        return resolve(messages);
      },
    )
  });


versionEventProducer.setPollInterval(100);
versionEventProducer.on('ready', async () => {
  writeLog(LogLevel.INFO, 'version_producer_startup', `Producer is ready`);
  try {
    await createTopic(
      config.app.kafka.topic.resVersionEvent.name,
      parseInt(config.app.kafka.topic.resVersionEvent.replication),
      {
        'cleanup.policy': 'delete',
        'retention.ms': '-1',
      },
    )
  } catch (error) {}
});

export const versionEventSendMessage = (
  key: string,
  value: string
) =>
  versionEventProducer.produce(
    config.app.kafka.topic.resVersionEvent.name,
    null,
    Buffer.from(value),
    key,
    Date.now(),
  )