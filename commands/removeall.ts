import { Context } from 'koishi';
import { Config } from '../config/schema';
import { removePluginLicense,removeAllCredentials } from '../utils/api';  

export function removeAllCommand(ctx: Context, config: Config) {
  ctx.command('DRremoveall', '移除所有插件凭证并删除数据库记录')
    .action(async ({ session }) => {
      const isQQ = session.platform === 'qq' && session.channelId === config.qq_channel_id;
      const isDiscord = session.platform === 'discord' && session.channelId === config.discord_channel_id;

      if (!isQQ && !isDiscord) {
        return '此指令仅在特定频道可用，请检查您的平台和频道。';
      }

      const userId = session.userId;
      const platform = session.platform;

      try {
        
        const response = await removeAllCredentials(userId, platform, config);

        if (!response.success) {
          return response.message;
        }

        const credentials = response.credentials;

        
        for (const playerid of credentials) {
          const licenseRemoved = await removePluginLicense(playerid, config);
          if (!licenseRemoved) {
            return `移除插件凭证失败，无法移除凭证：${playerid}。`;
          }
        }

        return '成功移除所有凭证并删除数据库记录。';

      } catch (error) {
        return `操作失败：${error.message}`;
      }
    });
}
