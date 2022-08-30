
export interface TextStyleConfig {
    /** 字体名称 */
    font: string;
    /** 字体大小 */
    fontSize: number,
    /** 字体颜色 '#rgb'('#000000') | [r, g, b] */
    color: string | number[],
    /** 字体透明度 0 ~ 1 */
    alpha: number,
    /** 边框大小 */
    stroke: number,
    /** 边框颜色 '#rgb'('#000000') | [r, g, b] | '#argb'('#ff000000') | [r, g, b, a] */
    strokeColor: string | number[],
    /** 是否为粗体 */
    bold: boolean,
    /** 是否为斜体 */
    italic: boolean,
    /** 是否启用阴影 */
    enableShadow: boolean,
    /** 阴影颜色 '#rgb'('#000000') | [r, g, b] | '#argb'('#ff000000') | [r, g, b, a] */
    shadowColor: string | number[],
    /** 阴影模糊大小 */
    shadowBlur: number,
    /** 阴影偏移量X */
    shadowOffsetX: number,
    /** 阴影偏移量Y */
    shadowOffsetY: number,
    /** 是否启用渐变颜色 */
    gradient: boolean,
    /** 渐变开始颜色 '#rgb'('#000000') | [r, g, b] | '#argb'('#ff000000') | [r, g, b, a] */
    startColor: string | number[],
    /** 渐变结束颜色 '#rgb'('#000000') | [r, g, b] | '#argb'('#ff000000') | [r, g, b, a] */
    endColor: string | number[],
    /** 是否启用外发光 */
    enableGlow: boolean,
    /** 外发光颜色 '#rgb'('#000000') | [r, g, b] | '#argb'('#ff000000') | [r, g, b, a]*/
    glowColor: string | number[],
    /** 外发光模糊大小 */
    glowBlur: number,
}
