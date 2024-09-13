import { Context } from 'koishi';
import { Config } from '../config/schema';

export function imageCommand(ctx: Context, config: Config) {
  ctx.command('image', '随机图片')
    .action(async ({ session }) => {
      try {
        const randomNum = Math.floor(Math.random() * config.maxImageNumber) + 1;
        const imageUrl = `${config.base_image_url}${randomNum}.png`;
        await session.send(`<image url="${imageUrl}"/>`);
      } catch (error) {
        return `生成随机图片时出错了喵: ${error.message}`;
      }
    });
}
