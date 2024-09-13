import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'

export function glamourCommand(ctx: Context, config: Config) {
  ctx.command('glamour', '查询随机幻化信息并发送图片')
    .action(async ({ session }) => {
      async function fetchAndSendGlamour(retryCount = 0) {
        try {
          const glamourId = Math.floor(Math.random() * (298365 - 208365 + 1)) + 208365;
          const url = "https://app.ffxivsc.cn/glamour/glamourInfo";

          const params = { "glamourId": glamourId };
          const headers = { "Accept": "application/json" };

          const response = await axios.get(url, { headers, params });
          if (response.status !== 200) {
            return `请求失败，状态码：${response.status}`;
          }

          const data = response.data;
          if (data?.data?.glamourUrls?.length > 0) {
            const glamourUrl = data.data.glamourUrls[0];

            const redirectResponse = await axios.get(glamourUrl, {
              headers,
              maxRedirects: 0,
              validateStatus: (status) => status === 302
            });

            const finalImageUrl = redirectResponse.headers.location;
            if (finalImageUrl) {
              const message = `作品ID: ${glamourId}\n名称: ${data.data.title || "无名"}\n描述: ${data.data.description || "无描述"}\n职业: ${data.data.jobName}\n种族: ${data.data.raceName}\n作者: ${data.data.name}\n`;
              await session.send(message);
              await session.send(`<image url="${finalImageUrl}"/>`);
            } else {
              await session.send(`无法获取重定向的图片地址`);
            }
          } else {
            if (retryCount < 1) {
              return await fetchAndSendGlamour(retryCount + 1);
            } else {
              await session.send(`两次请求均未找到图片,如果多次提示,请前往GitHub联系作者`);
            }
          }
        } catch (error) {
          return `请求幻化信息时出错：${error.message}`;
        }
      }

      const result = await fetchAndSendGlamour();
      if (result) await session.send(result);
    });
}
