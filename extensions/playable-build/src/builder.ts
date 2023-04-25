import { IBuildPluginConfig } from "../@types/packages/builder/@types";


export function load() {

}

export function unload() {

}

export const configs: Record<string, IBuildPluginConfig> = {
    'web-mobile': {
        hooks: './hooks',
        options: {
            export3DFile: {
                label: 'i18n:export3DFile',
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
                verifyRules: [],
            },
            packDataJS: {
                label: 'i18n:packDataJS',
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
                verifyRules: [],
            },
        },
        verifyRuleMap: {
            ruleTest: {
                message: 'i18n:cocos-build-template.ruleTest_msg',
                func(val) {
                    if (val === 'cocos') {
                        return true;
                    }
                    return false;
                }
            }
        }
    },
};
