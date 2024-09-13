import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'

export function calendarCommand(ctx: Context, config: Config) {
  ctx.command('calendar', '查询FF14活动日历')
    .action(async () => {
      try {
        const response = await axios.get('https://apiff14risingstones.web.sdo.com/api/home/active/calendar/getActiveCalendarMonth', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });

        const data = response.data;

        if (data.code !== 10000 || !data.data) {
          return `-\n获取活动日历失败：${data.msg || '未知错误'}`;
        }

        const events = data.data.map((event: any) => {
          const beginTime = new Date(event.begin_time * 1000).toLocaleString();
          const endTime = new Date(event.end_time * 1000).toLocaleString();
          return `-\n活动名称: ${event.name}\n开始时间: ${beginTime}\n结束时间: ${endTime}`;
        }).join('\n');

        return `-\n当前活动列表:\n${events}`;
      } catch (error) {
        return `-\n获取活动日历时出错: ${error.message}`;
      }
    });
}
