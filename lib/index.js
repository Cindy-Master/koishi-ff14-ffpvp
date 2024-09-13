var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  name: () => name
});
module.exports = __toCommonJS(src_exports);

// src/config/schema.ts
var import_koishi = require("koishi");
var ConfigSchema = import_koishi.Schema.object({
  session: import_koishi.Schema.string().description("请求 FFPVP API 时的 session").required(),
  client_id: import_koishi.Schema.string().description("FFLogs API 的 client_id").required(),
  client_secret: import_koishi.Schema.string().description("FFLogs API 的 client_secret").required(),
  cookie: import_koishi.Schema.string().description("请求 石之家 API 时的 cookie").required(),
  base_image_url: import_koishi.Schema.string().description("随机图片的基础 URL").required(),
  api_url: import_koishi.Schema.string().description("激活插件的 API URL").required(),
  api_cookie: import_koishi.Schema.string().description("激活插件的 Cookie").required(),
  plugin_name: import_koishi.Schema.string().description("插件名称").required(),
  qq_channel_id: import_koishi.Schema.string().description("QQ平台的频道ID").required(),
  discord_channel_id: import_koishi.Schema.string().description("Discord平台的频道ID").required(),
  maxCredentials: import_koishi.Schema.number().description("每个用户最多可激活的凭证数量"),
  apiUrl: import_koishi.Schema.string().description("Supabase API 的 URL").required(),
  apiKey: import_koishi.Schema.string().description("Supabase API Key").required(),
  permissionActivationDays: import_koishi.Schema.object({
    level1: import_koishi.Schema.number().default(7).description("1级用户激活天数"),
    level2: import_koishi.Schema.number().default(14).description("2级用户激活天数"),
    level3: import_koishi.Schema.number().default(30).description("3级用户激活天数"),
    level4: import_koishi.Schema.number().default(7).description("4级用户激活天数")
  }),
  permissionCooldownDays: import_koishi.Schema.object({
    level1: import_koishi.Schema.number().default(5).description("1级用户冷却天数"),
    level2: import_koishi.Schema.number().default(10).description("2级用户冷却天数"),
    level3: import_koishi.Schema.number().default(14).description("3级用户冷却天数"),
    level4: import_koishi.Schema.number().default(5).description("4级用户冷却天数")
  })
});

// src/utils/api.ts
var import_axios = __toESM(require("axios"));
async function activatePluginWithSingleApiCall(playerid, userId, platform, config) {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  const body = {
    p_playerid: playerid,
    p_userid: userId,
    p_platform: platform,
    p_max_credentials: config.maxCredentials,
    p_permission_activation_days: config.permissionActivationDays,
    p_permission_cooldown_days: config.permissionCooldownDays
  };
  try {
    const response = await import_axios.default.post(`${config.apiUrl}/rpc/activate_plugin`, body, { headers });
    const data = response.data[0];
    if (data.success) {
      const activationTime = new Date(data.activation_time);
      const expirationTime = new Date(data.expiration_time);
      const nextAvailableTime = new Date(data.next_available_time);
      const permissionLevel = data.permission_level;
      const remainingCredentials = data.remaining_credentials;
      await activatePlugin(playerid, permissionLevel, config);
      return `成功激活插件：${config.plugin_name}，玩家凭证：${playerid}。
激活时间：${activationTime.toLocaleString()}。
过期时间：${expirationTime.toLocaleString()}。
下次可认证时间：${nextAvailableTime.toLocaleString()}。
剩余可验证凭证数量：${remainingCredentials}
您的权限级别：${permissionLevel}`;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    throw new Error(`激活失败：${error.response?.data?.message || error.message}`);
  }
}
__name(activatePluginWithSingleApiCall, "activatePluginWithSingleApiCall");
async function removeAllCredentials(userId, platform, config) {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  const body = {
    p_userid: userId,
    p_platform: platform
  };
  try {
    const response = await import_axios.default.post(`${config.apiUrl}/rpc/remove_all_credentials`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
__name(removeAllCredentials, "removeAllCredentials");
async function removeCredential(userId, platform, playerid, config) {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  const body = {
    p_userid: userId,
    p_platform: platform,
    p_playerid: playerid
  };
  try {
    const response = await import_axios.default.post(`${config.apiUrl}/rpc/remove_credential`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
__name(removeCredential, "removeCredential");
async function getUserInfo(userId, platform, config) {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  const body = {
    p_userid: userId,
    p_platform: platform,
    p_max_credentials: config.maxCredentials,
    p_permission_cooldown_days: config.permissionCooldownDays
  };
  try {
    const response = await import_axios.default.post(`${config.apiUrl}/rpc/get_user_info`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
__name(getUserInfo, "getUserInfo");
async function removePluginLicense(playerid, config) {
  const url = `${config.api_url}/licenses/del`;
  const postData = {
    playerid,
    plugin: config.plugin_name
  };
  const headers = {
    "Content-Type": "application/json",
    "Cookie": config.api_cookie
  };
  const response = await import_axios.default.post(url, postData, { headers });
  return response.status === 200;
}
__name(removePluginLicense, "removePluginLicense");
async function activatePlugin(playerid, permissionLevel, config) {
  const activationDays = config.permissionActivationDays[`level${permissionLevel}`];
  const postData = {
    playerid,
    plugin: config.plugin_name,
    days: activationDays
  };
  const headers = {
    "Content-Type": "application/json",
    "Cookie": config.api_cookie
  };
  const activationUrl = `${config.api_url}/licenses/add`;
  const response = await import_axios.default.post(activationUrl, postData, { headers });
  if (response.status !== 200) {
    throw new Error(`激活失败，服务器返回状态码：${response.status}`);
  }
}
__name(activatePlugin, "activatePlugin");
async function getAccessToken(client_id, client_secret) {
  const token_url = "https://cn.fflogs.com/oauth/token";
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  try {
    const response = await import_axios.default.post(token_url, {
      grant_type: "client_credentials"
    }, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
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
__name(getAccessToken, "getAccessToken");
async function queryCharacterData(access_token, character_name, server_slug, boss_id, difficulty) {
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
    "Accept": "*/*"
  };
  const response = await import_axios.default.post(graphql_url, { query }, { headers });
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(`Error querying character data: ${response.status} ${response.data}`);
  }
}
__name(queryCharacterData, "queryCharacterData");
async function getUIDByCharacterName(character_name, group_name, config) {
  try {
    const response = await import_axios.default.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
      headers: {
        "session": config.session
      }
    });
    const data = response.data;
    if (data.result && data.result.length > 0) {
      const character = data.result.find((char) => char.group_name === group_name);
      return character ? character.uid : null;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`查询UID时出错：${error.message}`);
  }
}
__name(getUIDByCharacterName, "getUIDByCharacterName");
async function updateUserPermissionLevel(playerid, newLevel, requestUserId, config) {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  const body = {
    p_playerid: playerid,
    p_new_level: newLevel,
    p_request_userid: requestUserId
  };
  try {
    const response = await import_axios.default.post(`${config.apiUrl}/rpc/update_user_permission_level`, body, { headers });
    const data = response.data[0];
    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
__name(updateUserPermissionLevel, "updateUserPermissionLevel");

// src/commands/remove.ts
function removeCommand(ctx, config) {
  ctx.command("DRremove <playerid>", "移除插件凭证并删除数据库记录").action(async ({ session }, playerid) => {
    if (!playerid) {
      return "请提供一个凭证进行移除，例如: /dr-remove 123456789";
    }
    const isQQ = session.platform === "qq" && session.channelId === config.qq_channel_id;
    const isDiscord = session.platform === "discord" && session.channelId === config.discord_channel_id;
    if (!isQQ && !isDiscord) {
      return "此指令仅在特定频道可用，请检查您的平台和频道。";
    }
    const userId = session.userId;
    const platform = session.platform;
    try {
      const response = await removeCredential(userId, platform, playerid, config);
      if (!response.success) {
        return response.message;
      }
      const licenseRemoved = await removePluginLicense(playerid, config);
      if (!licenseRemoved) {
        return `移除插件凭证失败，无法移除凭证：${playerid}。`;
      }
      return `成功移除凭证并删除数据库记录：${playerid}。`;
    } catch (error) {
      return `操作失败：${error.message}`;
    }
  });
}
__name(removeCommand, "removeCommand");

// src/commands/kill.ts
var import_axios2 = __toESM(require("axios"));
function killCommand(ctx, config) {
  ctx.command("kill <character_name|uid> [group_name]", "查询角色击杀次数").action(async (_, character_name_or_uid, group_name) => {
    let uid = character_name_or_uid;
    if (!/^\d+$/.test(character_name_or_uid)) {
      if (!group_name) {
        return "-\n请提供服务器名 例: /kill 丝瓜卡夫卡 拂晓之间";
      }
      try {
        uid = await getUIDByCharacterName(character_name_or_uid, group_name, config);
        if (!uid) {
          return `-
您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
        }
      } catch (error) {
        return `-
您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
      }
    }
    try {
      const response = await import_axios2.default.get(`https://ffpvp.top/api/character/search?uid=${encodeURIComponent(uid)}&column=kill_times`, {
        headers: {
          "session": config.session
        }
      });
      const data = response.data;
      if (data && data.uid && data.character_name && data.group_name && data.kill_times !== void 0) {
        return `-
您查询的UID为${uid}:
角色名: ${data.character_name}
服务器: ${data.group_name}
UID: ${data.uid}
击杀次数: ${data.kill_times}`;
      } else {
        return `-
您查询的UID为${uid}，未找到相关角色的击杀次数信息, 请确认UID或信息无误。`;
      }
    } catch (error) {
      return `-
您查询的UID为${uid}，未找到相关角色的击杀次数信息, 请确认UID或信息无误。`;
    }
  });
}
__name(killCommand, "killCommand");

// src/commands/guild.ts
var import_axios3 = __toESM(require("axios"));
function guildCommand(ctx, config) {
  ctx.command("guild <group_name> <guild_name>", "查询部队信息").action(async (_, group_name, guild_name) => {
    if (!group_name || !guild_name) {
      return "-\n请提供有效的服务器名称和部队名称 例:/guild 拂晓之间 部队名";
    }
    try {
      const response = await import_axios3.default.get(`https://ffpvp.top/api/character/by-guild?group_name=${encodeURIComponent(group_name)}&guild_name=${encodeURIComponent(guild_name)}`, {
        headers: {
          "session": config.session
        }
      });
      const data = response.data;
      if (data && data.result && data.result.length > 0) {
        const parsedResults = data.result.map((guild) => {
          return `-
角色名: ${guild.character_name}
UID: ${guild.uid}
部队名: ${guild.guild_name}
服务器: ${guild.group_name}`;
        }).join("\n");
        return `-
您查询的服务器为${group_name}，部队名为${guild_name}:
${parsedResults}`;
      } else {
        return `-
您查询的服务器为${group_name}，部队名为${guild_name}，未找到相关部队的信息。`;
      }
    } catch (error) {
      return `-
您查询的服务器为${group_name}，部队名为${guild_name}，未找到相关部队的信息。`;
    }
  });
}
__name(guildCommand, "guildCommand");

// src/commands/info.ts
var import_axios4 = __toESM(require("axios"));
function infoCommand(ctx, config) {
  ctx.command("info <character_name>", "查询角色信息").action(async (_, character_name) => {
    if (!character_name) {
      return "-\n请提供一个角色名 例:/info 丝瓜卡夫卡";
    }
    try {
      const response = await import_axios4.default.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
        headers: {
          "session": config.session
        }
      });
      const data = response.data;
      if (data.error) {
        return `-
您查询的角色名为${character_name}，查无此人`;
      }
      if (data.result && data.result.length > 0) {
        const parsedResults = data.result.map((character) => {
          return `
UID: ${character.uid}
角色名: ${character.character_name}
服务器: ${character.group_name}
记录时间: ${new Date(character.inserted_at).toLocaleString()}`;
        }).join("\n");
        return `-
您查询的角色名为${character_name}:
${parsedResults}`;
      } else {
        return `-
您查询的角色名为${character_name}，未找到角色信息。`;
      }
    } catch (error) {
      return `-
您查询的角色名为${character_name}，未找到角色信息。`;
    }
  });
}
__name(infoCommand, "infoCommand");

// src/commands/calendar.ts
var import_axios5 = __toESM(require("axios"));
function calendarCommand(ctx, config) {
  ctx.command("calendar", "查询FF14活动日历").action(async () => {
    try {
      const response = await import_axios5.default.get("https://apiff14risingstones.web.sdo.com/api/home/active/calendar/getActiveCalendarMonth", {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });
      const data = response.data;
      if (data.code !== 1e4 || !data.data) {
        return `-
获取活动日历失败：${data.msg || "未知错误"}`;
      }
      const events = data.data.map((event) => {
        const beginTime = new Date(event.begin_time * 1e3).toLocaleString();
        const endTime = new Date(event.end_time * 1e3).toLocaleString();
        return `-
活动名称: ${event.name}
开始时间: ${beginTime}
结束时间: ${endTime}`;
      }).join("\n");
      return `-
当前活动列表:
${events}`;
    } catch (error) {
      return `-
获取活动日历时出错: ${error.message}`;
    }
  });
}
__name(calendarCommand, "calendarCommand");

// src/commands/help.ts
function helpCommand(ctx) {
  ctx.command("help", "帮助信息").action(() => {
    return `-

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

10. /DRremoveall - 移除全部凭证(删库跑路)
  别名: /删库跑路

11. /DRremove <playerid> - 移除某人的凭证
  别名: /拉黑

12. /DRactivate <playerid> - 激活DR的凭证
  别名: /我是绿玩
        /激活

13. /DRinfo - 查询DR凭证信息
  别名: /凭证信息

14. /me - 查询自身信息

15. /DRup - 管理员提权

16. /help - 显示此帮助信息
  作用: 提供所有指令的详细说明和示例。
  别名: /帮助

  如有机器人相关建议或问题请前往github  Cindy-Master/FFPVP-RANK 发送issue 
  bot内测群924407945
    `;
  });
}
__name(helpCommand, "helpCommand");

// src/commands/image.ts
function imageCommand(ctx, config) {
  ctx.command("image", "随机图片").action(async ({ session }) => {
    try {
      const randomNum = Math.floor(Math.random() * 1487) + 1;
      const imageUrl = `${config.base_image_url}${randomNum}.png`;
      await session.send(`<image url="${imageUrl}"/>`);
    } catch (error) {
      return `生成随机图片时出错了喵: ${error.message}`;
    }
  });
}
__name(imageCommand, "imageCommand");

// src/commands/check.ts
var import_axios6 = __toESM(require("axios"));

// src/utils/constants.ts
var bossMap = {
  "绝欧": 1068,
  "绝龙诗": 1065,
  "绝亚": 1062,
  "绝神兵": 1061,
  "绝巴哈": 1060
};
var medalMap = {
  "绝欧": 25,
  "绝龙诗": 4,
  "绝亚": 3,
  "绝神兵": 2,
  "绝巴哈": 1
};

// src/commands/check.ts
function checkCommand(ctx, config) {
  ctx.command("check <character_name> <group_name> <raid_name>", "查询角色副本记录").action(async (_, character_name, group_name, raid_name) => {
    if (!character_name || !group_name || !raid_name) {
      return "-\n请提供角色名、服务器名和副本名\n例:/check 丝瓜卡夫卡 拂晓之间 绝欧\n 可查询的参数有 绝欧 绝龙诗 绝亚 绝神兵 绝巴哈";
    }
    const boss_id = bossMap[raid_name];
    const medal_id = medalMap[raid_name];
    if (!boss_id || !medal_id) {
      return `-
您查询的副本名为${raid_name}，无效的副本名，请提供有效的副本名`;
    }
    try {
      const server_slug = group_name;
      const difficulty = 100;
      const access_token = await getAccessToken(config.client_id, config.client_secret);
      const fflogsData = await queryCharacterData(access_token, character_name, server_slug, boss_id, difficulty);
      const encounterRankings = fflogsData?.data?.characterData?.character?.encounterRankings;
      const fflogsExists = encounterRankings && encounterRankings.totalKills > 0 && encounterRankings.fastestKill > 0;
      const fflogsMessage = fflogsExists ? "\nFFLOGS存在有效记录" : "\nFFLOGS没有有效记录";
      try {
        const partDateResponse = await import_axios6.default.get(`https://ffpvp.top/api/character/check?character_name=${encodeURIComponent(character_name)}&group_name=${encodeURIComponent(group_name)}&medal_id=${medal_id}`, {
          headers: {
            "session": config.session
          }
        });
        const partDateData = partDateResponse.data;
        const stoneRecordExists = partDateData.exists !== false;
        const achieveTime = stoneRecordExists ? new Date(partDateData.achieve_time).toLocaleString() : "未知时间";
        const stoneMessage = stoneRecordExists ? `
石之家记录过本时间为 ${achieveTime}` : `
石之家没有记录`;
        return `-
您查询的角色为${character_name}，服务器为${group_name}，副本名为${raid_name}:
${fflogsMessage}
${stoneMessage}`;
      } catch (stoneError) {
        return `-
FFLogs 查询成功，但石之家查询时出错：${stoneError.message}`;
      }
    } catch (fflogsError) {
      return `-
FFLogs 查询时出错：${fflogsError.message}`;
    }
  });
}
__name(checkCommand, "checkCommand");

// src/commands/activate.ts
function activateCommand(ctx, config) {
  ctx.command("activate <playerid>", "激活指定插件").action(async ({ session }, playerid) => {
    if (!playerid) {
      return "请提供一个凭证进行激活，例如: /activate 123456789";
    }
    const isQQ = session.platform === "qq" && session.channelId === config.qq_channel_id;
    const isDiscord = session.platform === "discord" && session.channelId === config.discord_channel_id;
    if (!isQQ && !isDiscord) {
      return "此指令仅在特定频道可用，请检查您的平台和频道。";
    }
    const userId = session.userId;
    const platform = session.platform;
    try {
      const message = await activatePluginWithSingleApiCall(playerid, userId, platform, config);
      return message;
    } catch (error) {
      return `激活失败：${error.message}`;
    }
  });
}
__name(activateCommand, "activateCommand");

// src/commands/house.ts
var import_axios7 = __toESM(require("axios"));
function houseCommand(ctx, config) {
  ctx.command("house <character_name> <group_name>", "查询角色的房屋信息").action(async (_, character_name, group_name) => {
    if (!character_name || !group_name) {
      return "-\n请提供有效的角色名和服务器名 例:/house 丝瓜卡夫卡 拂晓之间";
    }
    try {
      const uid = await getUIDByCharacterName(character_name, group_name, config);
      if (!uid) {
        return `-
您查询的角色名为${character_name}，服务器为${group_name}，未找到对应的 UID。`;
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
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
      };
      const response = await import_axios7.default.get(url, { headers });
      const data = response.data;
      if (data && data.data && data.data.characterDetail && data.data.characterDetail.length > 0) {
        const characterDetail = data.data.characterDetail[0];
        if (!characterDetail.hasOwnProperty("house_info")) {
          return "-\n玩家还没有roll到窝喵~";
        }
        if (characterDetail.house_info === "******") {
          return "-\n玩家房屋信息已屏蔽，无法查询喵~";
        }
        if (characterDetail.hasOwnProperty("house_remain_day")) {
          return `-
玩家房屋剩余天数为: ${characterDetail.house_remain_day}喵~`;
        } else {
          return "-\n玩家房屋无倒计时喵~";
        }
      }
    } catch (error) {
      return `-
您查询的角色名为${character_name}喵~，服务器为${group_name}喵~，查询房屋信息时出错了喵：${error.message}`;
    }
  });
}
__name(houseCommand, "houseCommand");

// src/commands/glamour.ts
var import_axios8 = __toESM(require("axios"));
function glamourCommand(ctx, config) {
  ctx.command("glamour", "查询随机幻化信息并发送图片").action(async ({ session }) => {
    async function fetchAndSendGlamour(retryCount = 0) {
      try {
        const glamourId = Math.floor(Math.random() * (298365 - 208365 + 1)) + 208365;
        const url = "https://app.ffxivsc.cn/glamour/glamourInfo";
        const params = { "glamourId": glamourId };
        const headers = { "Accept": "application/json" };
        const response = await import_axios8.default.get(url, { headers, params });
        if (response.status !== 200) {
          return `请求失败，状态码：${response.status}`;
        }
        const data = response.data;
        if (data?.data?.glamourUrls?.length > 0) {
          const glamourUrl = data.data.glamourUrls[0];
          const redirectResponse = await import_axios8.default.get(glamourUrl, {
            headers,
            maxRedirects: 0,
            validateStatus: /* @__PURE__ */ __name((status) => status === 302, "validateStatus")
          });
          const finalImageUrl = redirectResponse.headers.location;
          if (finalImageUrl) {
            const message = `作品ID: ${glamourId}
名称: ${data.data.title || "无名"}
描述: ${data.data.description || "无描述"}
职业: ${data.data.jobName}
种族: ${data.data.raceName}
作者: ${data.data.name}
`;
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
    __name(fetchAndSendGlamour, "fetchAndSendGlamour");
    const result = await fetchAndSendGlamour();
    if (result) await session.send(result);
  });
}
__name(glamourCommand, "glamourCommand");

// src/commands/history.ts
var import_axios9 = __toESM(require("axios"));
function historyCommand(ctx, config) {
  ctx.command("history <character_name|uid> [group_name]", "查询角色历史记录").action(async (_, character_name_or_uid, group_name) => {
    let uid = character_name_or_uid;
    if (!/^\d+$/.test(character_name_or_uid)) {
      if (!group_name) {
        return "-\n请提供服务器名 例: /history 丝瓜卡夫卡 拂晓之间";
      }
      try {
        uid = await getUIDByCharacterName(character_name_or_uid, group_name, config);
        if (!uid) {
          return `-
您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID。`;
        }
      } catch (error) {
        return `-
您查询的角色名为${character_name_or_uid}，服务器为${group_name}，未找到对应的 UID`;
      }
    }
    try {
      const response = await import_axios9.default.get(`https://ffpvp.top/api/character/history?uid=${encodeURIComponent(uid)}`, {
        headers: {
          "session": config.session
        }
      });
      const data = response.data;
      if (data.error) {
        return `-
您查询的UID为${uid}，查询时出错：${data.error}`;
      }
      if (data.result && data.result.length > 0) {
        const parsedResults = data.result.map((entry) => {
          return `-
角色名: ${entry.character_name}
服务器: ${entry.group_name}
记录时间: ${new Date(entry.inserted_at).toLocaleString()}`;
        }).join("\n");
        return `-
您查询的UID为${uid}:
${parsedResults}`;
      } else {
        return `-
您查询的UID为${uid}，未找到历史记录, 请确认UID或信息无误。`;
      }
    } catch (error) {
      return `-
您查询的UID为${uid}，未找到历史记录, 请确认UID或信息无误。`;
    }
  });
}
__name(historyCommand, "historyCommand");

// src/commands/infoDR.ts
function infoDRCommand(ctx, config) {
  ctx.command("DRinfo", "查询自身的凭证信息").action(async ({ session }) => {
    const userId = session.userId;
    const platform = session.platform;
    try {
      const response = await getUserInfo(userId, platform, config);
      if (!response.success) {
        return response.message;
      }
      const credentials = response.credentials;
      const remainingCredentials = response.remaining_credentials;
      const permissionLevel = response.permission_level;
      const permissionDesc = response.permission_description;
      const formattedResults = credentials.map((cred) => {
        const activationTime = new Date(cred.ActivationTime);
        const nextAvailableTime = new Date(cred.NextAvailableTime);
        return `玩家凭证: ${cred.Credential}
激活时间: ${activationTime.toLocaleString()}
下次可认证时间: ${nextAvailableTime.toLocaleString()}`;
      }).join("\n\n");
      return `您的凭证信息:
${formattedResults}
剩余可验证凭证数量：${remainingCredentials}
您的权限：${permissionDesc}`;
    } catch (error) {
      return `查询失败：${error.message}`;
    }
  });
}
__name(infoDRCommand, "infoDRCommand");

// src/commands/status.ts
function statusCommand(ctx) {
  ctx.command("me", "查看当前会话的状态信息").action(({ session }) => {
    if (!session) {
      return "无法获取会话信息。";
    }
    const statusInfo = `
平台: ${session.platform}
用户ID: ${session.userId}
频道ID: ${session.channelId}
群组ID: ${session.guildId}
消息类型: ${session.type}
会话内容: ${session.content}
`;
    return statusInfo.trim();
  });
}
__name(statusCommand, "statusCommand");

// src/commands/DRup.ts
function drupCommand(ctx, config) {
  ctx.command("drup <playerid> <level>", "提升指定用户的权限等级").action(async ({ session }, playerid, level) => {
    if (!playerid || !level) {
      return "请提供凭证和新的权限等级，例如: /drup 123456789 2";
    }
    const isQQ = session.platform === "qq" && session.channelId === config.qq_channel_id;
    const isDiscord = session.platform === "discord" && session.channelId === config.discord_channel_id;
    if (!isQQ && !isDiscord) {
      return "此指令仅在特定频道可用，请检查您的平台和频道。";
    }
    const userId = session.userId;
    try {
      const result = await updateUserPermissionLevel(playerid, parseInt(level), userId, config);
      if (result.success) {
        return `操作成功：${result.message}`;
      } else {
        return `操作失败：${result.message}`;
      }
    } catch (error) {
      return `操作失败：${error.message}`;
    }
  });
}
__name(drupCommand, "drupCommand");

// src/commands/removeall.ts
function removeAllCommand(ctx, config) {
  ctx.command("DRremoveall", "移除所有插件凭证并删除数据库记录").action(async ({ session }) => {
    const isQQ = session.platform === "qq" && session.channelId === config.qq_channel_id;
    const isDiscord = session.platform === "discord" && session.channelId === config.discord_channel_id;
    if (!isQQ && !isDiscord) {
      return "此指令仅在特定频道可用，请检查您的平台和频道。";
    }
    const userId = session.userId;
    const platform = session.platform;
    try {
      const response = await removeAllCredentials(userId, platform, config);
      if (!response.success) {
        return response.message;
      }
      const credentials = response.credentials;
      for (const playerid of credentials) {
        const licenseRemoved = await removePluginLicense(playerid, config);
        if (!licenseRemoved) {
          return `移除插件凭证失败，无法移除凭证：${playerid}。`;
        }
      }
      return "成功移除所有凭证并删除数据库记录。";
    } catch (error) {
      return `操作失败：${error.message}`;
    }
  });
}
__name(removeAllCommand, "removeAllCommand");

// src/index.ts
var name = "ff14-ffpvp";
var Config = ConfigSchema;
function apply(ctx, config) {
  removeCommand(ctx, config);
  killCommand(ctx, config);
  guildCommand(ctx, config);
  infoCommand(ctx, config);
  calendarCommand(ctx, config);
  helpCommand(ctx);
  imageCommand(ctx, config);
  checkCommand(ctx, config);
  activateCommand(ctx, config);
  houseCommand(ctx, config);
  glamourCommand(ctx, config);
  historyCommand(ctx, config);
  infoDRCommand(ctx, config);
  removeAllCommand(ctx, config);
  statusCommand(ctx);
  drupCommand(ctx, config);
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  name
});
