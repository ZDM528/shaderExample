//此文件是自动生成，请不要修改哟！ 

import GameConfigManager, { IGameConfig } from "./playable/gameConfig/GameConfigManager";

export default interface GameConfig extends IGameConfig<GameConfig> {
	/** default value: 1 */
	playAgain: number;
	/** default value: 2000 */
	config: number;
	/** default value: otter */
	otterName: string;
	/** default value: true */
	config1: boolean;
	/** default value: Bathe + feed */
	config2: string;
	/** default value: red,yellow */
	config3: object;
	/** default value: noodles,eggs,soup */
	config4: object;
	/** default value: false */
	config5_1: boolean;
	/** default value: 0 */
	config5_2: number;
	/** default value: 0 */
	config5_3: number;
	/** default value: #ff0000 */
	config6: string;
}

type ConfigType = { readonly [Property in keyof GameConfig]: GameConfig[Property] };
export var gameConfig: ConfigType = GameConfigManager.configValue as GameConfig;

declare global {
    var CC_PROJECTNAME: string;
}
globalThis.CC_PROJECTNAME = "CocosEmptyProject";