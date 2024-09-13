import { Context } from 'koishi';
import { Config as PluginConfig } from './config/schema';
export declare const name = "ff14-ffpvp";
export declare const Config: import("schemastery")<PluginConfig>;
export declare function apply(ctx: Context, config: PluginConfig): void;
