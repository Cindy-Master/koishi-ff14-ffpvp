import { Context } from 'koishi';
import { Config as PluginConfig, ConfigSchema } from './config/schema';  


import { removeCommand } from './commands/remove';
import { killCommand } from './commands/kill';
import { guildCommand } from './commands/guild';
import { infoCommand } from './commands/info';
import { calendarCommand } from './commands/calendar';
import { helpCommand } from './commands/help';
import { imageCommand } from './commands/image';
import { checkCommand } from './commands/check';
import { activateCommand } from './commands/activate';
import { houseCommand } from './commands/house';
import { glamourCommand } from './commands/glamour';
import { historyCommand } from './commands/history';
import { infoDRCommand } from './commands/infoDR';  
import { statusCommand } from './commands/status';
import { drupCommand } from './commands/DRup';
import { removeAllCommand } from './commands/removeall';

export const name = 'ff14-ffpvp';


export const Config = ConfigSchema;

export function apply(ctx: Context, config: PluginConfig) {
  
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
  removeAllCommand(ctx,config);
  statusCommand(ctx); 
  drupCommand(ctx,config);
}
