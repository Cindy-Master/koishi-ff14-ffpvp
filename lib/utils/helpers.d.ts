import { Config } from '../config/schema';
export declare function getPermissionDescription(permissionLevel: number): string;
export declare function checkUserPermission(userId: string, platform: string, config: Config): Promise<boolean>;
export declare function checkCooldown(playerid: string, userId: string, permissionLevel: number, config: Config): Promise<boolean>;
