import { Context } from 'koishi';
import { Config } from '../config/schema';
import { removePluginLicense,removeCredential } from '../utils/api';  

export function removeCommand(ctx: Context, config: Config) {
  ctx.command('DRremove <playerid>', '移除插件凭证并删除数据库记录')
    .action(async ({ session }, playerid) => {
      if (!playerid) {
        return '请提供一个凭证进行移除，例如: /dr-remove 123456789';
      }

      const isQQ = session.platform === 'qq' && session.channelId === config.qq_channel_id;
      const isDiscord = session.platform === 'discord' && session.channelId === config.discord_channel_id;

      if (!isQQ && !isDiscord) {
        return '此指令仅在特定频道可用，请检查您的平台和频道。';
      }

      const userId = session.userId;
      const platform = session.platform;

      try {
        
        const response = await removeCredential(userId, platform, playerid, config);

        if (!response.success) {
          return response.message;
        }

        
        const licenseRemoved = await removePluginLicense(playerid, config);
        if (!licenseRemoved) {
          return `移除插件凭证失败，无法移除凭证：${playerid}。`;
        }

        return `成功移除凭证并删除数据库记录：${playerid}。`;

      } catch (error) {
        return `操作失败：${error.message}`;
      }
    });
}
