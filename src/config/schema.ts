import { Schema } from 'koishi';

export interface Config {
  session: string;
  client_id: string;
  client_secret: string;
  cookie: string;
  base_image_url: string;
  api_url: string;
  api_cookie: string;
  plugin_name: string;
  qq_channel_id: string;
  discord_channel_id: string;
  maxCredentials: number;
  apiUrl: string;
  apiKey: string;

  permissionActivationDays: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
  permissionCooldownDays: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}


export const ConfigSchema: Schema<Config> = Schema.object({
  session: Schema.string().description('请求 FFPVP API 时的 session').required(),
  client_id: Schema.string().description('FFLogs API 的 client_id').required(),
  client_secret: Schema.string().description('FFLogs API 的 client_secret').required(),
  cookie: Schema.string().description('请求 石之家 API 时的 cookie').required(),
  base_image_url: Schema.string().description('随机图片的基础 URL').required(),
  api_url: Schema.string().description('激活插件的 API URL').required(),
  api_cookie: Schema.string().description('激活插件的 Cookie').required(),
  plugin_name: Schema.string().description('插件名称').required(),
  qq_channel_id: Schema.string().description('QQ平台的频道ID').required(),
  discord_channel_id: Schema.string().description('Discord平台的频道ID').required(),
  maxCredentials: Schema.number().description('每个用户最多可激活的凭证数量'),
  apiUrl: Schema.string().description('Supabase API 的 URL').required(),
  apiKey: Schema.string().description('Supabase API Key').required(),
  permissionActivationDays: Schema.object({
    level1: Schema.number().default(7).description('1级用户激活天数'),
    level2: Schema.number().default(14).description('2级用户激活天数'),
    level3: Schema.number().default(30).description('3级用户激活天数'),
    level4: Schema.number().default(7).description('4级用户激活天数'),
  }),
  permissionCooldownDays: Schema.object({
    level1: Schema.number().default(5).description('1级用户冷却天数'),
    level2: Schema.number().default(10).description('2级用户冷却天数'),
    level3: Schema.number().default(14).description('3级用户冷却天数'),
    level4: Schema.number().default(5).description('4级用户冷却天数'),
  }),
});
