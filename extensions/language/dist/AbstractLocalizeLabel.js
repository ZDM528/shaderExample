"use strict";
// type Selector<$> = { $: Record<keyof $, any | null> }
function fromHEX(hexString) {
    hexString = (hexString.indexOf('#') === 0) ? hexString.substring(1) : hexString;
    const r = parseInt(hexString.substr(0, 2), 16) || 0;
    const g = parseInt(hexString.substr(2, 2), 16) || 0;
    const b = parseInt(hexString.substr(4, 2), 16) || 0;
    const a = parseInt(hexString.substr(6, 2), 16) || 255;
    return { r, g, b, a };
}
function parseColor(color) {
    if (typeof color === "string")
        return fromHEX(color);
    return { r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: color[3] == null ? 255 : color[3] * 255 };
}
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
        let localizeLabel = dump.value;
        for (let langKey of Object.keys(langConfigData)) {
            optionsHtml += `<option value="${langKey}">${langKey}</option>`;
        }
        // @ts-ignore
        this.$.languageSelect.innerHTML = optionsHtml;
        // @ts-ignore
        this.$.languageSelect.value = localizeLabel.localizeKey.value;
        // @ts-ignore
        this.dump = dump;
    },
    ready() {
        const setLabelProperty = function (node, indexLabel, perpertyName, type, value) {
            Editor.Message.send("scene", "set-property", {
                uuid: node.uuid.value,
                path: `__comps__.${indexLabel}.${perpertyName}`,
                dump: { type: type, value: value, }
            });
        };
        const changeLabel = async function (dump, key) {
            var _a, _b;
            let node = await Editor.Message.request("scene", "query-node", dump.value.node.value.uuid);
            const components = node.__comps__;
            let indexLabel = components.findIndex(x => x.type == "cc.Label");
            if (indexLabel == -1)
                return;
            let label = components[indexLabel];
            let langConfigData = await Editor.Message.request('language', 'getLangConfigData');
            let data = langConfigData[key];
            if (data == null)
                return;
            label.value.string.value = key;
            setLabelProperty(node, indexLabel, "string", "String", data.value);
            setLabelProperty(node, indexLabel, "lineHeight", "Number", 0);
            if (data.style.fontSize)
                setLabelProperty(node, indexLabel, "fontSize", "Number", data.style.fontSize);
            setLabelProperty(node, indexLabel, "isBold", "Boolean", (_a = data.style.bold) !== null && _a !== void 0 ? _a : false);
            setLabelProperty(node, indexLabel, "isItalic", "Boolean", (_b = data.style.italic) !== null && _b !== void 0 ? _b : false);
            if (data.style.color) {
                let color = parseColor(data.style.color);
                if (data.style.alpha)
                    color.a = data.style.alpha * 255;
                setLabelProperty(node, indexLabel, "color", "cc.Color", color);
            }
            else if (data.style.alpha) {
                setLabelProperty(node, indexLabel, "color", "cc.Color", { r: 255, g: 255, b: 255, a: data.style.alpha * 255 });
            }
        };
        // @ts-ignore
        this.$.languageSelect.addEventListener('change', (event) => {
            // @ts-ignore
            let dump = this.dump;
            let value = dump.value.localizeKey.value = event.target.value;
            let options = {
                uuid: dump.value.node.value.uuid,
                path: `${dump.path}.localizeKey`,
                dump: {
                    type: "String",
                    value: value
                }
            };
            Editor.Message.send("scene", "set-property", options);
            changeLabel(dump, event.target.value);
        });
    },
    // close() {
    //     // TODO something
    // }
};
module.exports = Editor.Panel.define(obj);
