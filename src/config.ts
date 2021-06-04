import * as dotenv from 'dotenv';

dotenv.config();

export const app = {
  namespace: process.env['NAMESPACE'] || 'app.priconne.resver.tracker',
  apis: {
    port: process.env['APIS_PORT'] || '8080',
  },
  services: {
    appVersion: {
      baseURL: process.env['SERVICES_APPVERSION_BASEURL'] || '',
    }
  },
  kafka: {
    bootstrap: process.env['KAFKA_BOOSTRAP'] || '',
    topic: {
      schedule: {
        name: process.env['KAFKA_SCHEDULE_TOPIC_NAME'] || '',
        replication: process.env['KAFKA_SCHEDULE_TOPIC_REPLICATION'] || '1',
      },
      resVersionEvent: {
        name: process.env['KAFKA_RESVEREVENT_TOPIC_NAME'] || '',
        replication: process.env['KAFKA_RESVEREVENT_TOPIC_REPLICATION'] || '1',
      },
    },
  },
  mongo: {
    uri: process.env['MONGODB_URI'] || '',
  }
};

export const checkRequiredConfig = () : boolean => {

  if(!app.kafka.bootstrap || !app.kafka.topic.schedule.name) {
    throw new Error("Kafka is required in order to execute update tasks")
  }

  if(!app.mongo.uri) {
    throw new Error("MongoDB is required to store the information")
  }

  return true;
}