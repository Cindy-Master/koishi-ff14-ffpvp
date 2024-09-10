import { Context, Schema } from 'koishi';
export declare const name = "ff14-ffpvp";
export interface Config {
    session: string;
    client_id: string;
    client_secret: string;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
