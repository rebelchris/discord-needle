import * as defaultConfig from '../config.json';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

interface IConfig {
  discordApiToken?: string | undefined;
  threadChannels?: [string | undefined];
  threadArchiveDuration: string;
  threadMessage: {
    shouldSend: boolean;
    shouldPin: boolean;
    content: string;
    embeds: string[];
  };
  dev: {
    clientId: string;
    guildId: string;
  };
}

export function getConfig(): IConfig {
  const config = <IConfig>defaultConfig;
  config.discordApiToken = process.env.API_TOKEN;
  config.threadChannels = [process.env.CHANNEL];
  console.log(config);
  return config;
}
