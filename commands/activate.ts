import { Context } from 'koishi'
import { Config } from '../config/schema'
import { activatePlugin,activatePluginWithSingleApiCall } from '../utils/api'

export function activateCommand(ctx: Context, config: Config) {
  ctx.command('activate <playerid>', '激活指定插件').action(async ({ session }, playerid) => {
    if (!playerid) {
      return '请提供一个凭证进行激活，例如: /activate 123456789';
    }

    const isQQ = session.platform === 'qq' && session.channelId === config.qq_channel_id;
    const isDiscord = session.platform === 'discord' && session.channelId === config.discord_channel_id;

    if (!isQQ && !isDiscord) {
      return '此指令仅在特定频道可用，请检查您的平台和频道。';
    }

    const userId = session.userId;
    const platform = session.platform;

    try {
      const message = await activatePluginWithSingleApiCall(playerid, userId, platform, config);
      return message;
    } catch (error) {
      return `激活失败：${error.message}`;
    }
  });
}

