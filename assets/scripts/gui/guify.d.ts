
interface GuiFyOption {
    /** The name used on the menu bar / panel. */
    title: string;
    /** default=""dark"": The name of the theme to be used, or an object matching one of the themes in "themes.js" if you want to create your own */
    theme: "light" | "dark" | "yorha" | object;
    /** default="document.body": The HTML element that is used as the parent of the created menu and panel. */
    root: Element;
    /** default=""300"": The width of the panel. You can use any CSS-compatible value here, so you can use ""30%"" or ""20em"" */
    width: string;
    /** default=""left"": Aligns the panel to the left or right side of the root. */
    align: "left" | "right";
    /** 
     * default="offset" Changes the way the layout bar is inserted into the root 
     * "overlay": The menu bar is fixed to the top of the root, overlapping content beneath it.
     * "above": The menu bar is fixed above the root. Does not alter layout within root.- In this mode, the menu bar can overlap content just above the root. If you don't want this, you can either use the ""offset"" mode, or set "margin-top: var(--size-menu-bar-height)".
     * "offset": Similar to ""above"", but some ""margin-top"" is added to the root to compensate for the menu bar's height.
     * */
    barMode: "overlay" | "above" | "offset";
    /** 
     * default=""inner"": Changes the way the panel is anchored relative to the container 
     * "inner": The panel shows inside of the container.
     * "outer": The panel shows outside the container, positioned along whichever side you specified with "align".
     * */
    panelMode: "inner" | "outer";
    /**
     * default="scroll": Changes the way the panel behaves when its contents exceed the height of the container.- Values:
  -  * "scroll": The contents will be scrollable.
  -  * "overflow": The panel will grow beyond the edge of the container.
     */
    panelOverflowBehavior: "scroll" | "overflow";
    /** default="1.0": Opacity value for the panel. */
    opacity: number;
    /** default="100": The rate in milliseconds at which the components will be refreshed from their bound variables. */
    pollRateMS: number;
    /** default="false": If true, the panel will be forced open at startup. */
    open: boolean;
}

/**
 * Components have a few shared methods you may call after initialization.
 */
declare class GuifyComponent {
    /**
     * Sets the component enabled/disabled style.
     * @param enabled 
     */
    public SetEnabled(enabled: boolean);
    /** Removes the component from the GUI. */
    public Remove(): void;
}

type ComponentType = "button" | "checkbox" | "color" | "range" | "interval" | "select" | "text" | "display" | "file" | "folder" | "title";

interface GuifyBaseOption<T extends ComponentType> {
    /** The component type that will be created */
    type: T;
    /** The text label that appears next to the component. */
    label: string;
    /** The initial value of the component. If you don't specify this, it will be copied from the bound value if there is one, or otherwise initialized to the variable type's default value. */
    initial?: Object;
    /** Fired every time the value governed by the component changes, with a single argument holding the value. */
    onChange?: (value: any) => void;
    /** Fired when the component is initialized. */
    onInitialize?: () => void;
    /** The label of the folder to put the component into. If none is specified it'll just go in the panel at the root level. */
    folder?: string;
    /** Whether the component starts out enabled or not (only works for interactive components). This can be modified at runtime with component.SetEnabled(Bool). */
    enabled?: boolean;
}

interface GuifyObjectOption<T extends ComponentType> extends GuifyBaseOption<T> {
    /** The object holding the property you want the component to be bound to. */
    object?: Object;
    /** The name of the property in object that you want the component to be bound to. object[property] and the value of the component will be bound (updating one will change the other). */
    property?: string;
}

/** Shows an editable text box. */
interface TextComponent extends GuifyObjectOption<"text"> {
    /** 
     * default="input": Corresponds to the string you'd pass to addEventListener() on a vanilla text field. Can be either "input" or "change".
     * "input" makes it so that every keystroke sends an event.
     * "change" makes it so that an event is only sent when the field loses focus or you press Enter.
     */
    listenMode?: "input" | "change";
}

/** Represents a button. */
interface ButtonComponent extends GuifyBaseOption<"button"> {
    /** Called when the button is clicked. */
    action: () => void;
}

/** Represents true/false. */
interface CheckboxComponent extends GuifyObjectOption<"checkbox"> {
}

/** Represents a color. Can show RGB or hex colors. */
interface ColorComponent extends GuifyObjectOption<"color"> {
    /** default="hex": Can be either "rgb" or "hex". */
    format?: "rgb" | "hex";
}

/** Displays the bound value. */
interface DisplayComponent extends GuifyBaseOption<"display"> {
}

interface TitleComponent extends GuifyBaseOption<"title"> {
}

/** Button / drop area for file selection. */
interface FileComponent extends GuifyBaseOption<"file"> {
    /**
     * The name of the method you want the FileReader inside this class to read files with. See the [FileReader docs](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) for more about what these methods do.
     */
    fileReadFunc: "readAsDataURL" | "readAsArrayBuffer" | "readAsBinaryString" | "readAsText";
}

/** Shows a slider representing a numerical value. */
interface RangeComponent extends GuifyObjectOption<"range"> {
    /** int: The smallest possible value on the slider. */
    min: number;
    /** int: The largest possible value on the slider. */
    max: number;
    /** default=3: The maximum number of digits displayed for the value if it's a decimal. */
    precision?: number;
    /**
     * default=0.01 [see notes]): The amount that is incremented by each movement of the slider. Only effective when "scale = linear".- If the precision is set, then the step will by default be the smallest value possible given the precision. 
     * For example, if precision = 3, then step = 0.01, or if precision = 5, then step = 0.0001.
     */
    step?: number;
    /** Specifies the scaling behavior of the slider. */
    scale?: "linear" | "log";
}

/** Shows an adjustable two-handle slider representing an interval. */
interface IntervalComponent extends GuifyObjectOption<"interval"> {
    /** int: The smallest possible value on the slider. */
    min: number;
    /** int: The largest possible value on the slider. */
    max: number;
    /** default=3: The maximum number of digits displayed for the value if it's a decimal. */
    precision?: number;
    /**
     * default=0.01 [see notes]): The amount that is incremented by each movement of the slider. Only effective when "scale = linear".- If the precision is set, then the step will by default be the smallest value possible given the precision. 
     * For example, if precision = 3, then step = 0.01, or if precision = 5, then step = 0.0001.
     */
    step?: number;
    /** Specifies the scaling behavior of the slider. */
    scale?: "linear" | "log";
}

/** Shows a dropdown with the specified options. */
interface SelectComponent extends GuifyObjectOption<"select"> {
    /** A list of strings representing the different selectable options. */
    options: readonly string[];
}

/**
 * An expanding/collapsing area that you can put other components into. To do this, use folder: 'folderLabel' as an option of another component, where folderLabel is the label of a folder.
 */
interface FolderComponent extends GuifyBaseOption<"folder"> {
    /** default=true: Show or hide the folder by default */
    open?: boolean;
}

type Components = TextComponent | ButtonComponent | CheckboxComponent | ColorComponent | DisplayComponent | FileComponent | RangeComponent | IntervalComponent | SelectComponent | FolderComponent | TitleComponent;

declare class Guify {
    /**
     * 
     * @param opts 
     */
    public constructor(opts: Partial<GuiFyOption>);
    /**
     * Displays a toast-style message on screen. "stayMS" and "transitionMS" are optional values that you can use to control the duration and removal animation time of the notification.
     * @param message 
     * @param stayMS 
     * @param transitionMS 
     */
    public Toast(message: string, stayMS?: number, transitionMS?: number): void;

    /**
     * Creates a new component in the panel based on opts. You can provide one opts object or an array if you want to create many components at once.
     * @param opts 
     * @param applyToAll 
     * @returns Returns the component
     */
    public Register<T extends Components>(opts: T, applyToAll?: boolean): GuifyComponent;

    /**
     * Removes the specified component. 
     * All properties of "applyToAll" will be applied to each opts object.
     * @param component 
     */
    public Remove(component): void
}