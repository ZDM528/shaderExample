// type Selector<$> = { $: Record<keyof $, any | null> }

// export const template = `
// <ui-prop type="dump" class="test"></ui-prop>
// `;

// export const $ = {
//     test: '.test',
// };

// export function update(this: Selector<typeof $> & typeof methods, dump: any) {
//     // 使用 ui-porp 自动渲染，设置 prop 的 type 为 dump
//     // render 传入一个 dump 数据，能够自动渲染出对应的界面
//     // 自动渲染的界面修改后，能够自动提交数据
//     this.$.test.render(dump.label.value);
// }
// export function ready(this: Selector<typeof $> & typeof methods) {}

interface LangConfigData {
    value: string,
    style: {
        fontSize: number,
        color: string | number[],
        alpha: number,
        bold: true,
        italic: boolean,
    },
}

function fromHEX(hexString: string): { r: number, g: number, b: number, a: number } {
    hexString = (hexString.indexOf('#') === 0) ? hexString.substring(1) : hexString;
    const r = parseInt(hexString.substr(0, 2), 16) || 0;
    const g = parseInt(hexString.substr(2, 2), 16) || 0;
    const b = parseInt(hexString.substr(4, 2), 16) || 0;
    const a = parseInt(hexString.substr(6, 2), 16) || 255;
    return { r, g, b, a };
}

function parseColor(color: string | number[]): { r: number, g: number, b: number, a: number } {
    if (typeof color === "string") return fromHEX(color);
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
    methods: {
    },

    async update(dump: any) {
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
        const setLabelProperty = function (node: { uuid: { value: string } }, indexLabel: number, perpertyName: string, type: string, value: any) {
            Editor.Message.send("scene", "set-property", {
                uuid: node.uuid.value,
                path: `__comps__.${indexLabel}.${perpertyName}`,
                dump: { type: type, value: value, }
            });
        }
        const changeLabel = async function (dump: any, key: string) {
            let node = await Editor.Message.request("scene", "query-node", dump.value.node.value.uuid);
            const components: any[] = node.__comps__;
            let indexLabel = components.findIndex(x => x.type == "cc.Label");
            if (indexLabel == -1) return;
            let label = components[indexLabel];
            let langConfigData = await Editor.Message.request('language', 'getLangConfigData');
            let data: LangConfigData = langConfigData[key];
            if (data == null) return;
            label.value.string.value = key;
            setLabelProperty(node, indexLabel, "string", "String", data.value);
            setLabelProperty(node, indexLabel, "lineHeight", "Number", 0);
            if (data.style.fontSize)
                setLabelProperty(node, indexLabel, "fontSize", "Number", data.style.fontSize);
            setLabelProperty(node, indexLabel, "isBold", "Boolean", data.style.bold ?? false);
            setLabelProperty(node, indexLabel, "isItalic", "Boolean", data.style.italic ?? false);
            if (data.style.color) {
                let color = parseColor(data.style.color);
                if (data.style.alpha) color.a = data.style.alpha * 255;
                setLabelProperty(node, indexLabel, "color", "cc.Color", color);
            } else if (data.style.alpha) {
                setLabelProperty(node, indexLabel, "color", "cc.Color", { r: 255, g: 255, b: 255, a: data.style.alpha * 255 });
            }
        }
        // @ts-ignore
        this.$.languageSelect.addEventListener('change', (event: any) => {
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
}

export = Editor.Panel.define(obj);