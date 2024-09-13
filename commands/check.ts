import { Context } from 'koishi'
import { getAccessToken, queryCharacterData } from '../utils/api'
import axios from 'axios'
import { Config } from '../config/schema'
import { bossMap, medalMap } from '../utils/constants'

export function checkCommand(ctx: Context, config: Config) {
  ctx.command('check <character_name> <group_name> <raid_name>', '查询角色副本记录')
    .action(async (_, character_name, group_name, raid_name) => {

      if (!character_name || !group_name || !raid_name) {
        return '-\n请提供角色名、服务器名和副本名\n例:/check 丝瓜卡夫卡 拂晓之间 绝欧\n 可查询的参数有 绝欧 绝龙诗 绝亚 绝神兵 绝巴哈';
      }

      const boss_id = bossMap[raid_name];
      const medal_id = medalMap[raid_name];
      if (!boss_id || !medal_id) {
        return `-\n您查询的副本名为${raid_name}，无效的副本名，请提供有效的副本名`;
      }

      try {
        const server_slug = group_name;
        const difficulty = 100;

        const access_token = await getAccessToken(config.client_id, config.client_secret);
        const fflogsData = await queryCharacterData(access_token, character_name, server_slug, boss_id, difficulty);

        const encounterRankings = fflogsData?.data?.characterData?.character?.encounterRankings;

        const fflogsExists = encounterRankings && encounterRankings.totalKills > 0 && encounterRankings.fastestKill > 0;

        const fflogsMessage = fflogsExists ? '\nFFLOGS存在有效记录' : '\nFFLOGS没有有效记录';

        try {
          const partDateResponse = await axios.get(`https://ffpvp.top/api/character/check?character_name=${encodeURIComponent(character_name)}&group_name=${encodeURIComponent(group_name)}&medal_id=${medal_id}`, {
            headers: {
              'session': config.session,
            },
          });

          const partDateData = partDateResponse.data;
          const stoneRecordExists = partDateData.exists !== false;

          const achieveTime = stoneRecordExists ? new Date(partDateData.achieve_time).toLocaleString() : '未知时间';

          const stoneMessage = stoneRecordExists ? `\n石之家记录过本时间为 ${achieveTime}` : `\n石之家没有记录`;

          return `-\n您查询的角色为${character_name}，服务器为${group_name}，副本名为${raid_name}:\n${fflogsMessage}\n${stoneMessage}`;

        } catch (stoneError) {
          return `-\nFFLogs 查询成功，但石之家查询时出错：${stoneError.message}`;
        }

      } catch (fflogsError) {
        return `-\nFFLogs 查询时出错：${fflogsError.message}`;
      }
    });
}
