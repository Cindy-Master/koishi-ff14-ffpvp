import { Context } from 'koishi';

export function statusCommand(ctx: Context) {
  ctx.command('me', '查看当前会话的状态信息')
    .action(({ session }) => {
      if (!session) {
        return '无法获取会话信息。';
      }

      const statusInfo = `
平台: ${session.platform}
用户ID: ${session.userId}
频道ID: ${session.channelId}
群组ID: ${session.guildId}
消息类型: ${session.type}
会话内容: ${session.content}
`;

      return statusInfo.trim();
    });
}
