import { Context } from 'koishi';
import { Config } from '../config/schema';
import { getUserInfo } from '../utils/api';

export function infoDRCommand(ctx: Context, config: Config) {
  ctx.command('DRinfo', '查询自身的凭证信息')
    .action(async ({ session }) => {
      const userId = session.userId;
      const platform = session.platform;

      try {
        
        const response = await getUserInfo(userId, platform, config);

        if (!response.success) {
          return response.message;
        }

        const credentials = response.credentials;
        const remainingCredentials = response.remaining_credentials;
        const permissionLevel = response.permission_level;
        const permissionDesc = response.permission_description;

        const formattedResults = credentials.map((cred: any) => {
          const activationTime = new Date(cred.ActivationTime);
          const nextAvailableTime = new Date(cred.NextAvailableTime);

          return `玩家凭证: ${cred.Credential}\n激活时间: ${activationTime.toLocaleString()}\n下次可认证时间: ${nextAvailableTime.toLocaleString()}`;
        }).join('\n\n');

        return `您的凭证信息:\n${formattedResults}\n剩余可验证凭证数量：${remainingCredentials}\n您的权限：${permissionDesc}`;
      } catch (error) {
        return `查询失败：${error.message}`;
      }
    });
}
