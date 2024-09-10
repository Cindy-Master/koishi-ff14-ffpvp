import { Context, Schema } from 'koishi'
import axios from 'axios'

// 插件名称
export const name = 'ff14-ffpvp'


export interface Config {
  session: string,
  client_id: string,
  client_secret: string,
}

// 定义插件的配置结构
export const Config: Schema<Config> = Schema.object({
  session: Schema.string().description('请求 API 时需要传递的 session').required(),
  client_id: Schema.string().description('FFLogs API 的 client_id').required(),
  client_secret: Schema.string().description('FFLogs API 的 client_secret').required(),
})

const bossMap: Record<string, number> = {
  '绝欧': 1068,
  '绝龙诗': 1065,
  '绝亚': 1062,
  '绝神兵': 1061,
  '绝巴哈': 1060,
}

const medalMap: Record<string, number> = {
  '绝欧': 25,
  '绝龙诗': 4,
  '绝亚': 3,
  '绝神兵': 2,
  '绝巴哈': 1,
}

async function getAccessToken(client_id, client_secret) {
  const token_url = "https://cn.fflogs.com/oauth/token";
  
  // 生成 Basic Auth Header (base64 编码)
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  try {
    const response = await axios.post(token_url, {
      grant_type: 'client_credentials',
    }, {
      headers: {
        'Authorization': `Basic ${auth}`, // 使用 Basic Auth 传递 client_id 和 client_secret
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error(`Error getting access token: ${response.status} ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

async function queryCharacterData(access_token: string, character_name: string, server_slug: string, boss_id: number, difficulty: number) {
  const graphql_url = "https://cn.fflogs.com/api/v2/client";
  const query = `
  {
    characterData {
      character(name: "${character_name}", serverRegion: "cn", serverSlug: "${server_slug}") {
        encounterRankings(encounterID: ${boss_id}, difficulty: ${difficulty})
      }
    }
  }
  `;

  const headers = {
    "Authorization": `Bearer ${access_token}`,
    "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    "Content-Type": "application/json",
    "Accept": "*/*",
  };

  const response = await axios.post(graphql_url, { query }, { headers });
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(`Error querying character data: ${response.status} ${response.data}`);
  }
}
export function apply(ctx: Context, config: Config) {
  // 添加 'info' 命令，并接受一个参数 'character_name'
  ctx.command('info <character_name>', '查询角色信息')
  .action(async (_, character_name) => {
    // 检查是否提供了角色名
    if (!character_name) {
      return '-\n请提供一个角色名 例:/info 丝瓜卡夫卡'
    }

    try {
      // 调用 API 获取角色信息，使用配置中的 session
      const response = await axios.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
        headers: {
          'session': config.session
        }
      })

      // 解析 API 响应，提取重要信息
      const data = response.data
      if (data.error) {
        return `-\n您查询的角色名为${character_name}，查询时出错：${data.error}`
      }

      if (data.result && data.result.length > 0) {
        const parsedResults = data.result.map((character: any) => {
          return `\nUID: ${character.uid}\n角色名: ${character.character_name}\n服务器: ${character.group_name}\n记录时间: ${new Date(character.inserted_at).toLocaleString()}`
        }).join('\n')

        // 返回解析后的信息，并加上查看排行榜链接
        return `-\n您查询的角色名为${character_name}:\n${parsedResults}`
      } else {
        return `-\n您查询的角色名为${character_name}，未找到角色信息。`
      }
    } catch (error) {
      // 处理请求错误
      return `-\n您查询的角色名为${character_name}，查询时出错：${error.message}`
    }
  })

ctx.command('history <uid>', '查询角色历史记录')
  .action(async (_, uid) => {
    // 检查是否提供了 uid
    if (!uid) {
      return '-\n请提供一个有效的 UID\n例: /history 10001000\n 如不知道uid 请先使用info指令查询'
    }

    try {
      // 调用 API 获取角色历史记录，使用配置中的 session
      const response = await axios.get(`https://ffpvp.top/api/character/history?uid=${encodeURIComponent(uid)}`, {
        headers: {
          'session': config.session
        }
      })

      // 解析 API 响应，提取重要信息
      const data = response.data
      if (data.error) {
        return `-\n您查询的UID为${uid}，查询时出错：${data.error}`
      }

      if (data.result && data.result.length > 0) {
        const parsedResults = data.result.map((entry: any) => {
          return `-\n角色名: ${entry.character_name}\n服务器: ${entry.group_name}\n记录时间: ${new Date(entry.inserted_at).toLocaleString()}`
        }).join('\n')

        // 返回带有 UID 和解析结果的消息，并加上查看排行榜链接
        return `-\n您查询的UID为${uid}:\n${parsedResults}`
      } else {
        return `-\n您查询的UID为${uid}，未找到历史记录。`
      }
    } catch (error) {
      // 处理请求错误
      return `-\n您查询的UID为${uid}，查询历史记录时出错：${error.message}`
    }
  })

ctx.command('kill <uid>', '查询角色击杀次数')
  .action(async (_, uid) => {
    // 检查是否提供了 uid
    if (!uid) {
      return '-\n请提供一个有效的 UID\n例: /kill 10001000\n 如不知道uid 请先使用info指令查询'
    }

    try {
      // 调用 API 使用 UID 获取角色击杀次数
      const response = await axios.get(`https://ffpvp.top/api/character/search?uid=${encodeURIComponent(uid)}&column=kill_times`, {
        headers: {
          'session': config.session
        }
      })

      // 解析 API 响应
      const data = response.data;

      // 检查数据是否存在
      if (data && data.uid && data.character_name && data.group_name && data.kill_times !== undefined) {
        // 返回格式化后的信息
        return `-\n您查询的UID为${uid}:\n角色名: ${data.character_name}\n服务器: ${data.group_name}\nUID: ${data.uid}\n击杀次数: ${data.kill_times}`
      } else {
        return `-\n您查询的UID为${uid}，未找到相关角色的击杀次数信息。`
      }
    } catch (error) {
      // 处理请求错误
      return `-\n您查询的UID为${uid}，查询击杀次数时出错：${error.message}`
    }
  })

ctx.command('guild <group_name> <guild_name>', '查询部队信息')
  .action(async (_, group_name, guild_name) => {
    // 检查是否提供了 group_name 和 guild_name
    if (!group_name || !guild_name) {
      return '-\n请提供有效的服务器名称和部队名称 例:/guild 拂晓之间 部队名'
    }

    try {
      // 调用 API 获取部队信息
      const response = await axios.get(`https://ffpvp.top/api/character/by-guild?group_name=${encodeURIComponent(group_name)}&guild_name=${encodeURIComponent(guild_name)}`, {
        headers: {
          'session': config.session
        }
      })

      // 解析 API 响应
      const data = response.data;

      // 检查数据是否存在
      if (data && data.result && data.result.length > 0) {
        const parsedResults = data.result.map((guild: any) => {
          return `-\n角色名: ${guild.character_name}\nUID: ${guild.uid}\n部队名: ${guild.guild_name}\n服务器: ${guild.group_name}`
        }).join('\n')

        // 返回解析后的信息
        return `-\n您查询的服务器为${group_name}，部队名为${guild_name}:\n${parsedResults}`
      } else {
        return `-\n您查询的服务器为${group_name}，部队名为${guild_name}，未找到相关部队的信息。`
      }
    } catch (error) {
      // 处理请求错误
      return `-\n您查询的服务器为${group_name}，部队名为${guild_name}，查询时出错：${error.message}`
    }
  })

ctx.command('check <character_name> <group_name> <raid_name>', '查询角色副本记录')
  .action(async (_, character_name, group_name, raid_name) => {
    // 检查是否提供了必要的参数
    if (!character_name || !group_name || !raid_name) {
      return '-\n请提供角色名、服务器名和副本名\n例:/check 丝瓜卡夫卡 拂晓之间 绝欧\n 可查询的参数有 绝欧 绝龙诗 绝亚 绝神兵 绝巴哈';
    }

    // 检查副本名是否在映射表中
    const boss_id = bossMap[raid_name];
    const medal_id = medalMap[raid_name];
    if (!boss_id || !medal_id) {
      return `-\n您查询的副本名为${raid_name}，无效的副本名，请提供有效的副本名`;
    }

    try {
      // 第一步：使用 FFLogs 查询角色副本记录
      const server_slug = group_name;  // 将服务器名称用作server_slug
      const difficulty = 100;  // 假设查询普通难度

      // 获取FFLogs的access token并查询副本数据
      const access_token = await getAccessToken(config.client_id, config.client_secret);
      const fflogsData = await queryCharacterData(access_token, character_name, server_slug, boss_id, difficulty);

      const encounterRankings = fflogsData?.data?.characterData?.character?.encounterRankings;

      // 判断 FFLogs 是否有有效记录
      const fflogsExists = encounterRankings && encounterRankings.totalKills > 0 && encounterRankings.fastestKill > 0;

      // 如果有FFLogs数据，返回 "FFLOGS存在有效记录"；否则返回 "FFLOGS没有有效记录"
      const fflogsMessage = fflogsExists ? '\nFFLOGS存在有效记录' : '\nFFLOGS没有有效记录';

      try {
        // 第二步：查询石之家副本记录
        const partDateResponse = await axios.get(`https://ffpvp.top/api/character/check?character_name=${encodeURIComponent(character_name)}&group_name=${encodeURIComponent(group_name)}&medal_id=${medal_id}`, {
          headers: {
            'session': config.session,
          },
        });

        const partDateData = partDateResponse.data;
        const stoneRecordExists = partDateData.exists !== false;

        // 使用 achieve_time 而不是 part_date
        const achieveTime = stoneRecordExists ? new Date(partDateData.achieve_time).toLocaleString() : '未知时间';

        // 如果石之家有记录，返回记录时间；否则返回没有记录信息
        const stoneMessage = stoneRecordExists ? `\n石之家记录过本时间为 ${achieveTime}` : `\n石之家没有记录`;

        // 返回FFLogs和石之家的查询结果
        return `-\n您查询的角色为${character_name}，服务器为${group_name}，副本名为${raid_name}:\n${fflogsMessage}\n${stoneMessage}`;

      } catch (stoneError) {
        // 处理石之家查询时的报错
        return `-\nFFLogs 查询成功，但石之家查询时出错：${stoneError.message}`;
      }


    } catch (fflogsError) {
      // 处理FFLogs查询时的报错
      return `-\nFFLogs 查询时出错：${fflogsError.message}`;
    }
  });

  ctx.command('help', '帮助信息')
    .action(() => {
      return `-\n
可用指令列表：
1. /info <character_name> - 查询角色信息
    示例: /info 丝瓜卡夫卡
    作用: 根据角色名查询相关角色的基本信息，包括 UID、服务器、记录时间等。

2. /history <uid> - 查询角色历史记录
    示例: /history 10001000
    作用: 根据 UID 查询角色的历史记录。

3. /kill <uid> - 查询角色击杀次数
    示例: /kill 10001000
    作用: 根据 UID 查询角色的击杀次数。

4. /guild <group_name> <guild_name> - 查询部队信息
    示例: /guild 拂晓之间 部队名
    作用: 根据服务器和部队名查询部队成员信息。

5. /check <character_name> <group_name> <raid_name> - 查询角色副本记录
    示例: /check 丝瓜卡夫卡 拂晓之间 绝欧
    作用: 根据角色名、服务器名和副本名查询角色的副本记录。支持副本: 绝欧、绝龙诗、绝亚、绝神兵、绝巴哈。

6. /help - 显示此帮助信息
    作用: 提供所有指令的详细说明和示例。
      `
    })

}
