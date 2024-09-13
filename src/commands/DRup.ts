import { Context } from 'koishi';
import { updateUserPermissionLevel } from '../utils/api'; 

export function drupCommand(ctx: Context, config: any) {
  ctx.command('drup <playerid> <level>', '提升指定用户的权限等级')
    .action(async ({ session }, playerid, level) => {
      if (!playerid || !level) {
        return '请提供凭证和新的权限等级，例如: /drup 123456789 2';
      }

      const isQQ = session.platform === 'qq' && session.channelId === config.qq_channel_id;
      const isDiscord = session.platform === 'discord' && session.channelId === config.discord_channel_id;

      
      if (!isQQ && !isDiscord) {
        return '此指令仅在特定频道可用，请检查您的平台和频道。';
      }

      const userId = session.userId; 

      try {
        
        const result = await updateUserPermissionLevel(playerid, parseInt(level), userId, config);

        if (result.success) {
          return `操作成功：${result.message}`;
        } else {
          return `操作失败：${result.message}`;
        }
      } catch (error) {
        return `操作失败：${error.message}`;
      }
    });
}
