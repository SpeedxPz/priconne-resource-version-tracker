import * as os from 'os';
import { app } from '../../config';

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARNING = 40,
  ERROR = 50,
}

export const writeLog = (level: number, event: string, data: any) => {

  const logMessage: any = {
    level: level,
    event: event,
    hostname: os.hostname(),
    namespace: app.namespace,
  };

  if((typeof data) == "string") {
    logMessage['data'] = {
      message: data
    }
  } else {
    logMessage['data'] = {
      ...data
    }
  }

  console.log(JSON.stringify(logMessage));
}