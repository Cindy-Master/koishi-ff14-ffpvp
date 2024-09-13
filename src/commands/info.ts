import { Context } from 'koishi'
import axios from 'axios'
import { Config } from '../config/schema'

export function infoCommand(ctx: Context, config: Config) {
  ctx.command('info <character_name>', '查询角色信息')
    .action(async (_, character_name) => {

      if (!character_name) {
        return '-\n请提供一个角色名 例:/info 丝瓜卡夫卡'
      }

      try {
        const response = await axios.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
          headers: {
            'session': config.session
          }
        })

        const data = response.data
        if (data.error) {
          return `-\n您查询的角色名为${character_name}，查无此人`
        }

        if (data.result && data.result.length > 0) {
          const parsedResults = data.result.map((character: any) => {
            return `\nUID: ${character.uid}\n角色名: ${character.character_name}\n服务器: ${character.group_name}\n记录时间: ${new Date(character.inserted_at).toLocaleString()}`
          }).join('\n')

          return `-\n您查询的角色名为${character_name}:\n${parsedResults}`
        } else {
          return `-\n您查询的角色名为${character_name}，未找到角色信息。`
        }
      } catch (error) {
        return `-\n您查询的角色名为${character_name}，未找到角色信息。`
      }
    })
}
