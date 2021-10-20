import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { Message } from 'node-rdkafka';
import { ApiServer } from './api-server';
import * as config from './config';
import { checkUpdateAPIConnector, checkUpdateGuessConnector, ICheckUpdateResult } from './domains/version/update';
import { scheduleConsumer, schedulePollMessage, versionEventProducer, versionEventSendMessage } from './lib/kafka';
import { ConnectorType } from './model/ConnectorType';
import { IProfile, ProfileModel } from './model/profile';
import { IResourceVersionEvent } from './model/ResourceVersionEvent';
import { IScheduleCommand } from './model/ScheduleCommand';
import { LogLevel, writeLog } from './utils/logger';

dotenv.config();

const start = async () => {
  writeLog(LogLevel.INFO, 'startup', `${config.app.namespace}`);
  config.checkRequiredConfig();

  try {
    await scheduleConsumer.connect();
    await versionEventProducer.connect();
    await mongoose.connect(config.app.mongo.uri);
  } catch(error) {
    writeLog(LogLevel.ERROR, 'startup_error', `${error}`);
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
      writeLog(LogLevel.ERROR, 'consume_error', `${error}`);
      process.exit(1);
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
      writeLog(LogLevel.ERROR, 'check_for_update_error', `${error}`);
      return resolve();
    }

    const filterdProfile: IProfile[] = await ProfileModel.find({name: profile});
    if(!filterdProfile.length) {
      writeLog(LogLevel.ERROR, 'check_for_update_error', `profile ${profile} not found`);
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
          writeLog(LogLevel.ERROR, 'check_for_update_error', `profile type ${resultProfile.type} not found`);
          return resolve();
      }


      //Do something
      if(checkUpdateResult.isUpdated) {
        writeLog(LogLevel.INFO, 'new_version', {
          profile: {
            name: resultProfile.name,
            version: checkUpdateResult.resVersion
          }
        });

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
        writeLog(LogLevel.INFO, 'check_for_update',`No new version for ${resultProfile.name}`);
      }

    } catch (error) {
      return reject(error);
    }
    return resolve();
  });
}

process.on('uncaughtException', function (err) {
  writeLog(LogLevel.ERROR, 'uncaught_exception', `${err}`);
  process.exit(1)
})



start();
