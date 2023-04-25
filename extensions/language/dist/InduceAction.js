"use strict";
let obj = {
    $: {
        languageSelect: '.language-select',
    },
    template: `
        <ui-prop>
            <ui-label slot="label" value="language" tooltip="请选择一个多语言的key"></ui-label>
            <ui-select slot="content" class="language-select"></ui-select>
        </ui-prop>
    `,
    methods: {},
    async update(dump) {
        let langConfigData = await Editor.Message.request('language', 'getLangConfigData');
        let optionsHtml = '';
        let induceInstallAction = dump.value;
        for (let langKey of Object.keys(langConfigData)) {
            optionsHtml += `<option value="${langKey}">${langKey}</option>`;
        }
        // @ts-ignore
        this.$.languageSelect.innerHTML = optionsHtml;
        // @ts-ignore
        this.$.languageSelect.value = induceInstallAction.induceKeyText.value;
        // @ts-ignore
        this.$.languageSelect.addEventListener('change', (event) => {
            induceInstallAction.induceKeyText.value = event.target.value;
            let options = {
                uuid: dump.value.node.value.uuid,
                path: dump.path,
                dump: dump
            };
            Editor.Message.send("scene", "set-property", options);
        });
    },
    ready() {
        // let localizeLabel = this.$this.dump.value;
        // console.log("ready", localizeLabel);
        // this.$.languageSelect.innerHTML = localizeLabel.localizeKey;
        // this.$.languageSelect.addEventListener('change', (event: any, p2, p3) => {
        //     console.log('change...',event.target.value, event.target, event, p2, p3);
        //     // localizeLabel.localizeKey = event.target.value;
        // });
        // this.updateLanguages(this);
    },
    close() {
        // TODO something
    }
};
module.exports = Editor.Panel.define(obj);
