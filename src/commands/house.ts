import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'
import { getUIDByCharacterName } from '../utils/api'

export function houseCommand(ctx: Context, config: Config) {
  ctx.command('house <character_name> <group_name>', '查询角色的房屋信息')
    .action(async (_, character_name, group_name) => {
      if (!character_name || !group_name) {
        return '-\n请提供有效的角色名和服务器名 例:/house 丝瓜卡夫卡 拂晓之间';
      }

      try {
        const uid = await getUIDByCharacterName(character_name, group_name, config);

        if (!uid) {
          return `-\n您查询的角色名为${character_name}，服务器为${group_name}，未找到对应的 UID。`;
        }

        const url = `https://apiff14risingstones.web.sdo.com/api/home/userInfo/getUserInfo?uuid=${uid}&page=1&limit=30`;

        const headers = {
          "authority": "apiff14risingstones.web.sdo.com",
          "method": "GET",
          "scheme": "https",
          "accept": "application/json",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
          "cache-control": "max-age=0",
          "cookie": config.cookie,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        };

        const response = await axios.get(url, { headers });
        const data = response.data;

        if (data && data.data && data.data.characterDetail && data.data.characterDetail.length > 0) {
          const characterDetail = data.data.characterDetail[0];

          if (!characterDetail.hasOwnProperty('house_info')) {
            return '-\n玩家还没有roll到窝喵~';
          }

          if (characterDetail.house_info === '******') {
            return '-\n玩家房屋信息已屏蔽，无法查询喵~';
          }

          if (characterDetail.hasOwnProperty('house_remain_day')) {
            return `-\n玩家房屋剩余天数为: ${characterDetail.house_remain_day}喵~`;
          } else {
            return '-\n玩家房屋无倒计时喵~';
          }
        }
      } catch (error) {
        return `-\n您查询的角色名为${character_name}喵~，服务器为${group_name}喵~，查询房屋信息时出错了喵：${error.message}`;
      }
    });
}
