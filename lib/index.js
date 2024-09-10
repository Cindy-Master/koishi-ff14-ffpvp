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
var import_koishi = require("koishi");
var import_axios = __toESM(require("axios"));
var name = "ff14-ffpvp";
var Config = import_koishi.Schema.object({
  session: import_koishi.Schema.string().description("请求 API 时需要传递的 session").required(),
  client_id: import_koishi.Schema.string().description("FFLogs API 的 client_id").required(),
  client_secret: import_koishi.Schema.string().description("FFLogs API 的 client_secret").required()
});
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
async function getAccessToken(client_id, client_secret) {
  const token_url = "https://cn.fflogs.com/oauth/token";
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  try {
    const response = await import_axios.default.post(token_url, {
      grant_type: "client_credentials"
    }, {
      headers: {
        "Authorization": `Basic ${auth}`,
        // 使用 Basic Auth 传递 client_id 和 client_secret
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
function apply(ctx, config) {
  ctx.command("info <character_name>", "查询角色信息").action(async (_, character_name) => {
    if (!character_name) {
      return "-\n请提供一个角色名 例:/info 丝瓜卡夫卡";
    }
    try {
      const response = await import_axios.default.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
        headers: {
          "session": config.session
        }
      });
      const data = response.data;
      if (data.error) {
        return `-
您查询的角色名为${character_name}，查询时出错：${data.error}`;
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
您查询的角色名为${character_name}，查询时出错：${error.message}`;
    }
  });
  ctx.command("history <uid>", "查询角色历史记录").action(async (_, uid) => {
    if (!uid) {
      return "-\n请提供一个有效的 UID\n例: /history 10001000\n 如不知道uid 请先使用info指令查询";
    }
    try {
      const response = await import_axios.default.get(`https://ffpvp.top/api/character/history?uid=${encodeURIComponent(uid)}`, {
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
您查询的UID为${uid}，未找到历史记录。`;
      }
    } catch (error) {
      return `-
您查询的UID为${uid}，查询历史记录时出错：${error.message}`;
    }
  });
  ctx.command("kill <uid>", "查询角色击杀次数").action(async (_, uid) => {
    if (!uid) {
      return "-\n请提供一个有效的 UID\n例: /kill 10001000\n 如不知道uid 请先使用info指令查询";
    }
    try {
      const response = await import_axios.default.get(`https://ffpvp.top/api/character/search?uid=${encodeURIComponent(uid)}&column=kill_times`, {
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
您查询的UID为${uid}，未找到相关角色的击杀次数信息。`;
      }
    } catch (error) {
      return `-
您查询的UID为${uid}，查询击杀次数时出错：${error.message}`;
    }
  });
  ctx.command("guild <group_name> <guild_name>", "查询部队信息").action(async (_, group_name, guild_name) => {
    if (!group_name || !guild_name) {
      return "-\n请提供有效的服务器名称和部队名称 例:/guild 拂晓之间 部队名";
    }
    try {
      const response = await import_axios.default.get(`https://ffpvp.top/api/character/by-guild?group_name=${encodeURIComponent(group_name)}&guild_name=${encodeURIComponent(guild_name)}`, {
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
您查询的服务器为${group_name}，部队名为${guild_name}，查询时出错：${error.message}`;
    }
  });
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
        const partDateResponse = await import_axios.default.get(`https://ffpvp.top/api/character/check?character_name=${encodeURIComponent(character_name)}&group_name=${encodeURIComponent(group_name)}&medal_id=${medal_id}`, {
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
  ctx.command("help", "帮助信息").action(() => {
    return `-

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
      `;
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  name
});
