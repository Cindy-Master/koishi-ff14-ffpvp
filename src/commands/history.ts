import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'
import { getUIDByCharacterName } from '../utils/api'

export function historyCommand(ctx: Context, config: Config) {
  ctx.command('history <character_name|uid> [group_name]', '查询角色历史记录')
    .action(async (_, character_name_or_uid, group_name) => {
      let uid = character_name_or_uid;

      if (!/^\d+$/.test(character_name_or_uid)) {
        if (!group_name) {
          return '-\n请提供服务器名 例: /history 丝瓜卡夫卡 拂晓之间';
        }

        try {
          uid = await getUIDByCharacterName(character_name_or_uid, group_name, config);
          if (!uid) {
            return `-\n您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
          }
        } catch (error) {
          return `-\n您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID`;
        }
      }

      try {
        const response = await axios.get(`https://ffpvp.top/api/character/history?uid=${encodeURIComponent(uid)}`, {
          headers: {
            'session': config.session
          }
        });

        const data = response.data;
        if (data.error) {
          return `-\n您查询的UID为${uid}，查询时出错：${data.error}`;
        }

        if (data.result && data.result.length > 0) {
          const parsedResults = data.result.map((entry: any) => {
            return `-\n角色名: ${entry.character_name}\n服务器: ${entry.group_name}\n记录时间: ${new Date(entry.inserted_at).toLocaleString()}`;
          }).join('\n');

          return `-\n您查询的UID为${uid}:\n${parsedResults}`;
        } else {
          return `-\n您查询的UID为${uid}，未找到历史记录, 请确认UID或信息无误。`;
        }
      } catch (error) {
        return `-\n您查询的UID为${uid}，未找到历史记录, 请确认UID或信息无误。`;
      }
    });
}
