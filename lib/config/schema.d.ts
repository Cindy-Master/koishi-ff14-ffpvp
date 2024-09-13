import { Schema } from 'koishi';
export interface Config {
    session: string;
    client_id: string;
    client_secret: string;
    cookie: string;
    base_image_url: string;
    api_url: string;
    api_cookie: string;
    plugin_name: string;
    qq_channel_id: string;
    discord_channel_id: string;
    maxCredentials: number;
    apiUrl: string;
    apiKey: string;
    permissionActivationDays: {
        level1: number;
        level2: number;
        level3: number;
        level4: number;
    };
    permissionCooldownDays: {
        level1: number;
        level2: number;
        level3: number;
        level4: number;
    };
}
export declare const ConfigSchema: Schema<Config>;
