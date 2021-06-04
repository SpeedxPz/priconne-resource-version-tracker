import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Message } from 'node-rdkafka';
import { ApiServer } from './api-server';
import { IScheduleCommand } from './model/ScheduleCommand';
import * as config from './config';
import { checkUpdateAPIConnector, checkUpdateGuessConnector, ICheckUpdateResult } from './domains/version/update';
import { scheduleConsumer, schedulePollMessage, versionEventProducer, versionEventSendMessage } from './lib/kafka';
import { ConnectorType } from './model/ConnectorType';
import { IProfile, ProfileModel } from './model/profile';
import { IResourceVersionEvent } from './model/ResourceVersionEvent';
import { sleep } from './utils/common';
import { writeLog } from './utils/logger';

dotenv.config();

const start = async () => {
  writeLog(`Starting up as namespace: ${config.app.namespace}`);
  config.checkRequiredConfig();

  try {
    await scheduleConsumer.connect();
    await versionEventProducer.connect();
    await mongoose.connect(config.app.mongo.uri, {
      useNewUrlParser: true,
      useUnifiedTopology:true,
      useCreateIndex: true,
    });
  } catch(error) {
    writeLog(`[ERROR] Error occured while connect to store | Reason: ${error}`);
    await scheduleConsumer.disconnect();
    process.exit(1);
  }
  new ApiServer(parseInt(config.app.apis.port));
  messageExecutor();
};


const messageExecutor = async () => {
  while(true) {
    try {
      const kafkaMessage: Message[] = await schedulePollMessage();
      if(kafkaMessage.length) {
        for (const item of kafkaMessage) {
          if(item.key && item.key == config.app.namespace){
            await checkForUpdate(item);
          }
        }
        scheduleConsumer.commit();
      }
    } catch (error) {
      scheduleConsumer.commit();
      writeLog(`[WARN] Message executor error occured | reason: ${error}`);
      await sleep(1000);
    }
  }
};

const checkForUpdate = async (message: Message) => {
  return new Promise( async (resolve: Function, reject: Function) => {

    let profile: string;

    try {
      const command: IScheduleCommand = JSON.parse(message.value.toString()) as IScheduleCommand;
      if(!command.profile) throw new Error("Profile name is empty");
      profile = command.profile;
    } catch (error) {
      writeLog(`[WARN] CheckForUpdate skipped due to error | reason: ${error}`);
      return resolve();
    }

    const filterdProfile: IProfile[] = await ProfileModel.find({name: profile});
    if(!filterdProfile.length) {
      writeLog(`[WARN] CheckForUpdate skipped due to error | reason: profile ${profile} not found`);
      return resolve();
    }

    const resultProfile: IProfile = filterdProfile[0];

    try {

      let checkUpdateResult: ICheckUpdateResult;
      switch (resultProfile.type) {
        case ConnectorType.API_CONNECTOR:
          checkUpdateResult = await checkUpdateAPIConnector(resultProfile.settings);
          break;
        case ConnectorType.GUESS_CONNECTOR:
          checkUpdateResult = await checkUpdateGuessConnector(resultProfile.settings);
          break;
        default:
          writeLog(`[WARN] CheckForUpdate skipped due to error | reason: unknow profile type '${resultProfile.type}'`);
          return resolve();
      }


      //Do something
      if(checkUpdateResult.isUpdated) {
        writeLog(`New version for '${resultProfile.name}' is '${checkUpdateResult.resVersion}'`);

        const updateInfo: IResourceVersionEvent = {
          appId: checkUpdateResult.appId,
          serverCode: checkUpdateResult.serverCode,
          appVersion: checkUpdateResult.appVersion,
          resVersion: checkUpdateResult.resVersion,
          updateDate: checkUpdateResult.timestamp,
        };

        versionEventSendMessage(
          `priconne-resversion-notify-${updateInfo.serverCode}`,
          JSON.stringify(updateInfo),
        );

      } else {
        writeLog(`No new version for '${resultProfile.name}'`);
      }

    } catch (error) {
      return reject(error);
    }
    return resolve();
  });
}



start();
