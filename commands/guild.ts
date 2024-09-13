import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'

export function guildCommand(ctx: Context, config: Config) {
  ctx.command('guild <group_name> <guild_name>', '查询部队信息')
    .action(async (_, group_name, guild_name) => {

      if (!group_name || !guild_name) {
        return '-\n请提供有效的服务器名称和部队名称 例:/guild 拂晓之间 部队名'
      }

      try {
        const response = await axios.get(`https://ffpvp.top/api/character/by-guild?group_name=${encodeURIComponent(group_name)}&guild_name=${encodeURIComponent(guild_name)}`, {
          headers: {
            'session': config.session
          }
        })

        const data = response.data;

        if (data && data.result && data.result.length > 0) {
          const parsedResults = data.result.map((guild: any) => {
            return `-\n角色名: ${guild.character_name}\nUID: ${guild.uid}\n部队名: ${guild.guild_name}\n服务器: ${guild.group_name}`
          }).join('\n')

          return `-\n您查询的服务器为${group_name}，部队名为${guild_name}:\n${parsedResults}`
        } else {
          return `-\n您查询的服务器为${group_name}，部队名为${guild_name}，未找到相关部队的信息。`
        }
      } catch (error) {
        return `-\n您查询的服务器为${group_name}，部队名为${guild_name}，未找到相关部队的信息。`
      }
    })
}
