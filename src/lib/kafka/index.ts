import { AdminClient, KafkaConsumer, LibrdKafkaError, Message, Producer } from 'node-rdkafka';
import * as config from '../../config';
import { writeLog } from '../../utils/logger';


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
  writeLog("Kafka consumer is in ready state");
  try {
    await createTopic(
      config.app.kafka.topic.schedule.name,
      parseInt(config.app.kafka.topic.schedule.replication),
      {
        'cleanup.policy': 'compact'
      },
    )
  } catch (error) {
    writeLog(`[WARN] cannot create topic ${config.app.kafka.topic.schedule.name} | reason: ${error}`);
  } finally {
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
  writeLog("Kafka producer is in ready state");
  try {
    await createTopic(
      config.app.kafka.topic.resVersionEvent.name,
      parseInt(config.app.kafka.topic.resVersionEvent.replication),
      {
        'cleanup.policy': 'delete',
        'retention.ms': '-1',
      },
    )
  } catch (error) {
    writeLog(`[WARN] cannot create topic ${config.app.kafka.topic.resVersionEvent.name} | reason: ${error}`);
  }
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