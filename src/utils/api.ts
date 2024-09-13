

import axios from 'axios';
import { Config } from '../config/schema'; 




export async function getUserCredentials(playerid: string, config: Config): Promise<any | null> {
  const url = `${config.apiUrl}/Credentials?UserID=eq.${encodeURIComponent(playerid)}`;
  const headers = {
    "apikey": config.apiKey,
    "Authorization": `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await axios.get(url, { headers });
  if (response.status === 200 && response.data.length > 0) {
    return response.data[0];
  } else {
    return null;
  }
}


export async function getAllCredentials(config: Config): Promise<any[]> {
  const url = `${config.apiUrl}/Credentials?select=*`;
  const headers = {
    "apikey": config.apiKey,
    "Authorization": `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await axios.get(url, { headers });
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(`查询凭证失败，服务器返回状态码：${response.status}`);
  }
}



export function getPermissionDescription(permissionLevel: number): string {
  switch (permissionLevel) {
    case 1:
      return '欢迎你，普通用户';
    case 2:
      return '赞助者';
    case 3:
      return '高级赞助者';
    case 4:
      return '管理员';
    default:
      return '未知权限';
  }
}



export async function activatePluginWithSingleApiCall(
  playerid: string,
  userId: string,
  platform: string,
  config: Config
): Promise<string> {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  
  const body = {
    p_playerid: playerid,
    p_userid: userId,
    p_platform: platform,
    p_max_credentials: config.maxCredentials,
    p_permission_activation_days: config.permissionActivationDays,  
    p_permission_cooldown_days: config.permissionCooldownDays,      
  };

  try {
    const response = await axios.post(`${config.apiUrl}/rpc/activate_plugin`, body, { headers });

    const data = response.data[0];

    if (data.success) {
      const activationTime = new Date(data.activation_time);
      const expirationTime = new Date(data.expiration_time);
      const nextAvailableTime = new Date(data.next_available_time);
      const permissionLevel = data.permission_level;
      const remainingCredentials = data.remaining_credentials;

      
      await activatePlugin(playerid, permissionLevel, config);

      return `成功激活插件：${config.plugin_name}，玩家凭证：${playerid}。\n激活时间：${activationTime.toLocaleString()}。\n过期时间：${expirationTime.toLocaleString()}。\n下次可认证时间：${nextAvailableTime.toLocaleString()}。\n剩余可验证凭证数量：${remainingCredentials}\n您的权限级别：${permissionLevel}`;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    throw new Error(`激活失败：${error.response?.data?.message || error.message}`);
  }
}



export async function removeAllCredentials(userId: string, platform: string, config: Config): Promise<any> {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  const body = {
    p_userid: userId,
    p_platform: platform,
  };

  try {
    const response = await axios.post(`${config.apiUrl}/rpc/remove_all_credentials`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}




export async function removeCredential(userId: string, platform: string, playerid: string, config: Config): Promise<any> {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  const body = {
    p_userid: userId,
    p_platform: platform,
    p_playerid: playerid,
  };

  try {
    const response = await axios.post(`${config.apiUrl}/rpc/remove_credential`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}




export async function getUserInfo(userId: string, platform: string, config: Config): Promise<any> {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  const body = {
    p_userid: userId,
    p_platform: platform,
    p_max_credentials: config.maxCredentials,
    p_permission_cooldown_days: config.permissionCooldownDays,
  };

  try {
    const response = await axios.post(`${config.apiUrl}/rpc/get_user_info`, body, { headers });
    return response.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}



export async function removePluginLicense(playerid: string, config: Config): Promise<boolean> {
  const url = `${config.api_url}/licenses/del`;
  const postData = {
    playerid,
    plugin: config.plugin_name,
  };
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': config.api_cookie,
  };

  const response = await axios.post(url, postData, { headers });
  return response.status === 200;
}


export async function deleteDatabaseRecord(playerid: string, config: Config): Promise<boolean> {
  const deleteUrl = `${config.apiUrl}/Credentials?Credential=eq.${encodeURIComponent(playerid)}`;
  const deleteHeaders = {
    "apikey": config.apiKey,
    "Authorization": `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  const deleteResponse = await axios.delete(deleteUrl, { headers: deleteHeaders });
  return deleteResponse.status === 204;
}







export async function activatePlugin(playerid: string, permissionLevel: number, config: Config): Promise<void> {
  const activationDays = config.permissionActivationDays[`level${permissionLevel}`];

  const postData = {
    playerid,
    plugin: config.plugin_name,
    days: activationDays
  };

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': config.api_cookie
  };

  const activationUrl = `${config.api_url}/licenses/add`;

  const response = await axios.post(activationUrl, postData, { headers });

  if (response.status !== 200) {
    throw new Error(`激活失败，服务器返回状态码：${response.status}`);
  }
}


export async function getAccessToken(client_id: string, client_secret: string): Promise<string> {
  const token_url = "https://cn.fflogs.com/oauth/token";

  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  try {
    const response = await axios.post(token_url, {
      grant_type: 'client_credentials',
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
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


export async function queryCharacterData(access_token: string, character_name: string, server_slug: string, boss_id: number, difficulty: number): Promise<any> {
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


export async function getUIDByCharacterName(character_name: string, group_name: string, config: Config): Promise<string | null> {
  try {
    const response = await axios.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
      headers: {
        'session': config.session
      }
    });

    const data = response.data;
    if (data.result && data.result.length > 0) {
      const character = data.result.find((char: any) => char.group_name === group_name);
      return character ? character.uid : null;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`查询UID时出错：${error.message}`);
  }
}


export async function getCharacterInfo(character_name: string, config: Config): Promise<any> {
  try {
    const response = await axios.get(`https://ffpvp.top/api/character/info?character_name=${encodeURIComponent(character_name)}`, {
      headers: {
        'session': config.session
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询角色信息时出错：${error.message}`);
  }
}


export async function getCharacterHistory(uid: string, config: Config): Promise<any> {
  try {
    const response = await axios.get(`https://ffpvp.top/api/character/history?uid=${encodeURIComponent(uid)}`, {
      headers: {
        'session': config.session
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询角色历史记录时出错：${error.message}`);
  }
}


export async function getCharacterKillTimes(uid: string, config: Config): Promise<any> {
  try {
    const response = await axios.get(`https://ffpvp.top/api/character/search?uid=${encodeURIComponent(uid)}&column=kill_times`, {
      headers: {
        'session': config.session
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询角色击杀次数时出错：${error.message}`);
  }
}


export async function getGuildInfo(group_name: string, guild_name: string, config: Config): Promise<any> {
  try {
    const response = await axios.get(`https://ffpvp.top/api/character/by-guild?group_name=${encodeURIComponent(group_name)}&guild_name=${encodeURIComponent(guild_name)}`, {
      headers: {
        'session': config.session
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询部队信息时出错：${error.message}`);
  }
}


export async function checkCharacterRaid(character_name: string, group_name: string, raid_name: string, config: Config): Promise<any> {
  const bossMap: Record<string, number> = {
    '绝欧': 1068,
    '绝龙诗': 1065,
    '绝亚': 1062,
    '绝神兵': 1061,
    '绝巴哈': 1060,
  };

  const medalMap: Record<string, number> = {
    '绝欧': 25,
    '绝龙诗': 4,
    '绝亚': 3,
    '绝神兵': 2,
    '绝巴哈': 1,
  };

  const boss_id = bossMap[raid_name];
  const medal_id = medalMap[raid_name];
  if (!boss_id || !medal_id) {
    throw new Error(`无效的副本名：${raid_name}`);
  }

  try {
    const server_slug = group_name;
    const difficulty = 100;

    const access_token = await getAccessToken(config.client_id, config.client_secret);
    const fflogsData = await queryCharacterData(access_token, character_name, server_slug, boss_id, difficulty);

    const encounterRankings = fflogsData?.data?.characterData?.character?.encounterRankings;
    const fflogsExists = encounterRankings && encounterRankings.totalKills > 0 && encounterRankings.fastestKill > 0;

    const fflogsMessage = fflogsExists ? 'FFLOGS存在有效记录' : 'FFLOGS没有有效记录';

    
    const response = await axios.get(`https://ffpvp.top/api/character/check?character_name=${encodeURIComponent(character_name)}&group_name=${encodeURIComponent(group_name)}&medal_id=${medal_id}`, {
      headers: {
        'session': config.session,
      },
    });

    const partDateData = response.data;
    const stoneRecordExists = partDateData.exists !== false;
    const achieveTime = stoneRecordExists ? new Date(partDateData.achieve_time).toLocaleString() : '未知时间';
    const stoneMessage = stoneRecordExists ? `石之家记录过本时间为 ${achieveTime}` : `石之家没有记录`;

    return {
      fflogsMessage,
      stoneMessage,
    };

  } catch (error) {
    throw new Error(`查询副本记录时出错：${error.message}`);
  }
}


export async function updateUserPermissionLevel(playerid: string, newLevel: number, requestUserId: string, config: any): Promise<{ success: boolean; message: string }> {
  const headers = {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };

  const body = {
    p_playerid: playerid,
    p_new_level: newLevel,
    p_request_userid: requestUserId,
  };

  try {
    const response = await axios.post(`${config.apiUrl}/rpc/update_user_permission_level`, body, { headers });
    const data = response.data[0];

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}



export async function getCharacterHouseInfo(uid: string, config: Config): Promise<any> {
  try {
    const url = `https://apiff14risingstones.web.sdo.com/api/home/userInfo/getUserInfo?uuid=${uid}&page=1&limit=30`;

    const headers = {
      "authority": "apiff14risingstones.web.sdo.com",
      "method": "GET",
      "scheme": "https",
      "accept": "application/json",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "cookie": config.cookie,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    };

    const response = await axios.get(url, { headers });
    const data = response.data;

    if (data && data.data && data.data.characterDetail && data.data.characterDetail.length > 0) {
      const characterDetail = data.data.characterDetail[0];

      if (!characterDetail.hasOwnProperty('house_info')) {
        return '玩家还没有roll到窝喵~';
      }

      if (characterDetail.house_info === '******') {
        return '玩家房屋信息已屏蔽，无法查询喵~';
      }

      if (characterDetail.hasOwnProperty('house_remain_day')) {
        return `玩家房屋剩余天数为: ${characterDetail.house_remain_day}喵~`;
      } else {
        return '玩家房屋无倒计时喵~';
      }
    } else {
      return '未找到角色房屋信息';
    }
  } catch (error) {
    throw new Error(`查询房屋信息时出错：${error.message}`);
  }
}


export async function getFF14Events(): Promise<any> {
  try {
    const response = await axios.get('https://apiff14risingstones.web.sdo.com/api/home/active/calendar/getActiveCalendarMonth', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const data = response.data;

    if (data.code !== 10000 || !data.data) {
      throw new Error(`获取活动日历失败：${data.msg || '未知错误'}`);
    }

    return data.data;

  } catch (error) {
    throw new Error(`获取活动日历时出错: ${error.message}`);
  }
}
