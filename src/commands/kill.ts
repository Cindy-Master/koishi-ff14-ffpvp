import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'
import { getUIDByCharacterName } from '../utils/api'

export function killCommand(ctx: Context, config: Config) {
  ctx.command('kill <character_name|uid> [group_name]', '查询角色击杀次数')
    .action(async (_, character_name_or_uid, group_name) => {
      let uid = character_name_or_uid;

      if (!/^\d+$/.test(character_name_or_uid)) {
        if (!group_name) {
          return '-\n请提供服务器名 例: /kill 丝瓜卡夫卡 拂晓之间';
        }

        try {
          uid = await getUIDByCharacterName(character_name_or_uid, group_name, config);
          if (!uid) {
            return `-\n您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
          }
        } catch (error) {
          return `-\n您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
        }
      }

      try {
        const response = await axios.get(`https://ffpvp.top/api/character/search?uid=${encodeURIComponent(uid)}&column=kill_times`, {
          headers: {
            'session': config.session
          }
        });

        const data = response.data;

        if (data && data.uid && data.character_name && data.group_name && data.kill_times !== undefined) {
          return `-\n您查询的UID为${uid}:\n角色名: ${data.character_name}\n服务器: ${data.group_name}\nUID: ${data.uid}\n击杀次数: ${data.kill_times}`;
        } else {
          return `-\n您查询的UID为${uid}，未找到相关角色的击杀次数信息, 请确认UID或信息无误。`;
        }
      } catch (error) {
        return `-\n您查询的UID为${uid}，未找到相关角色的击杀次数信息, 请确认UID或信息无误。`;
      }
    });
}
