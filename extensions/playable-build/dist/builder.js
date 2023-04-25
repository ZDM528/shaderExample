"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
function load() {
}
exports.load = load;
function unload() {
}
exports.unload = unload;
exports.configs = {
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
