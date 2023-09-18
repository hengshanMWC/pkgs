import type { DefaultParams, GetConfig } from '../../defaultOptions'
export interface CommandPublishOption extends DefaultParams {

}

export type CommandPublishParams = Partial<CommandPublishOption>

export type CommandPublishConfig = GetConfig<CommandPublishOption>
