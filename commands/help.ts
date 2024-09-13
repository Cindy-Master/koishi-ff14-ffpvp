import { Context } from 'koishi'

export function helpCommand(ctx: Context) {
  ctx.command('help', '帮助信息')
  .action(() => {
    return `-\n
可用指令列表：
1. /info <character_name> - 查询角色信息
  示例: /info 丝瓜卡夫卡
  作用: 根据角色名查询相关角色的基本信息，包括 UID、服务器、记录时间等。
  别名: /查信息

2. /history <uid> - 查询角色历史记录
  示例: /history 10001000
  作用: 根据 UID 查询角色的历史记录。
  别名: /历史id

3. /kill <uid> - 查询角色击杀次数
  示例: /kill 10001000
  作用: 根据 UID 查询角色的击杀次数。
  别名: /查成分

4. /guild <group_name> <guild_name> - 查询部队信息
  示例: /guild 拂晓之间 部队名
  作用: 根据服务器和部队名查询部队成员信息。
  别名: /部队

5. /check <character_name> <group_name> <raid_name> - 查询角色副本记录
  示例: /check 丝瓜卡夫卡 拂晓之间 绝欧
  作用: 根据角色名、服务器名和副本名查询角色的副本记录。支持副本: 绝欧、绝龙诗、绝亚、绝神兵、绝巴哈。
  别名: /代一下

6. /house <character_name> <group_name> - 查询角色房屋信息
  示例: /house 丝瓜卡夫卡 拂晓之间
  作用: 查询角色的房屋剩余天数。如果房屋信息被屏蔽或不存在，舒音提示您喵~返回相关提示喵~。
  别名: /查房

7. /image - 随机返回一张FF14图片
  别名: /随机图片

8. /glamour - 随机返回一张光之收藏家的作品
  别名: /调料包

9. /calendar - 返回现在开展的FF14活动
  别名: /活动    

10. /drremoveall - 移除全部凭证(删库跑路)
  别名: /删库跑路

11. /drremove <playerid> - 移除某人的凭证
  别名: /拉黑
        /删除

12. /dractivate <playerid> - 激活DR的凭证
  别名: /我是绿玩
        /激活

13. /drinfo - 查询DR凭证信息
  别名: /凭证信息

14. /me - 查询自身信息

15. /drup - 管理员提权
    别名: /提权


16. /help - 显示此帮助信息
  作用: 提供所有指令的详细说明和示例。
  别名: /帮助

  如有机器人相关建议或问题请前往github  Cindy-Master/FFPVP-RANK 发送issue 
  bot内测群924407945
    `
  })
}
