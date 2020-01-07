import { StatelessComponent, StatelessProps, createElement } from 'tsx-create-element'

interface VectorProps {
    vector: Float32Array
    start?: number,
    length?: number
}

const coordinates = ['x', 'y', 'z', 'w'];

export const Vector: StatelessComponent<VectorProps> = (props: StatelessProps<VectorProps>) => {
    const start: number = props.start ?? 0;
    const length: number = Math.min(4, props.length ?? 4);
    const end: number = Math.min(start + length, props.vector.length);
    let components = []
    for(let i = start; i < end; i++){
        components.push(
            <label className="control-label">{coordinates[i-start]}</label>,
            <input type="number" step="0.05" value={props.vector[i]} onchange={(ev: InputEvent)=>{props.vector[i]=Number.parseFloat((ev.target as HTMLInputElement).value)}}/>
        )
    }
    return <span>
        {components}
    </span>;
}

interface ColorProps {
    color: Float32Array
    start?: number,
    length?: number
}

const color_coordinates = ['r', 'g', 'b', 'a'];

export const Color: StatelessComponent<ColorProps> = (props: StatelessProps<ColorProps>) => {
    const start: number = props.start ?? 0;
    const length: number = Math.min(4, props.length ?? 4);
    const end: number = Math.min(start + length, props.color.length);
    let components = []
    for(let i = start; i < end; i++){
        components.push(
            <label className="control-label">{color_coordinates[i-start]}</label>,
            <input type="number" step="0.05" value={props.color[i]} onchange={(ev: InputEvent)=>{props.color[i]=Number.parseFloat((ev.target as HTMLInputElement).value)}}/>
        )
    }
    return <span>
        {components}
    </span>;
}

interface SelectorProps {
    options: {[name: string]: string},
    value?: any,
    onchange: (value: any) => void,
    [name: string]: any
}

export const Selector: StatelessComponent<SelectorProps> = (props: StatelessProps<SelectorProps>) => {
    let {value, options, onchange, children, ...rest} = props;
    value = value ?? Object.keys(props.options)[0];
    value = value.toString();
    let optionsElements = []
    for(let key in props.options){
        if(key === value)
            optionsElements.push(<option value={key} selected>{props.options[key]}</option>)
        else
            optionsElements.push(<option value={key}>{props.options[key]}</option>)
    }
    return <select onchange={(ev: InputEvent) => {
        let e: HTMLSelectElement= ev.target as HTMLSelectElement;
        onchange(e.options[e.selectedIndex].value)
        }} {...rest}>
        {optionsElements}
    </select>
}

interface CheckBoxProps {
    value: boolean,
    onchange: (value: boolean) => void,
    [name: string]: any
}

export const CheckBox: StatelessComponent<CheckBoxProps> = (props: StatelessProps<CheckBoxProps>) => {
    let {value, onchange, children, ...rest} = props;
    return <input type="checkbox" checked={value?true:undefined} onchange={(ev: InputEvent)=>{onchange((ev.target as HTMLInputElement).checked)}}/>         
}