//@ts-nocheck
import {useEffect, useLayoutEffect, useState} from 'react'
import {codegen, Editor, Inputs} from "@compai/css-gui";
import {parse} from "../../Item/Item";


function format(style): object {
    let newStyle = {};
    if (!style) return newStyle;
    let strings = style.split('\n').slice(1, -1);
    strings.forEach((t, i) => {
        let [key, ...val] = t.trim().slice(0, -1).split(":");
        val = val.join(':');
        let n = "";
        for (let i = 0; i < key.length; i++) {
            if (key[i] === '-') {
                n += key[i + 1].toUpperCase();
                ++i;
            } else {
                n += key[i];
            }
        }
        val = val.replaceAll(`"`, ``);
        newStyle[key] = val;
    });
    console.log(newStyle)
    return newStyle;
}

function getVal(string) {
    try {
        let val = string.match(/\d*\.\d*/)[0];
        return [+val, string.replace(val, '').match(/\D/)[0]];
    } catch (e) {
        return [0, 'px'];
    }
}

function init(p) {
    let editor = p.editor || {};
    let baseStyle = JSON.parse(p.css);
    console.log('BASE', baseStyle)
    editor.width = {
        value: getVal(baseStyle.width)[0],
        unit: getVal(baseStyle.width)[1],
    }
    return editor;
}

export const CSSEditor = ({id, styles, setStyle}) => {
    const p = parse(styles);
    const style = init(p);
    const [editor, setEditor] = useState(style);
    useLayoutEffect(() => {
        setEditor(style);
    }, [id]);
    function applyStyles(e) {
        if (!Object.keys(e).length) return;
        setStyle(JSON.stringify({
            editor: e,
            css: format(codegen.css(e)),
        }));
    }
    return (
        <div className="editor">
            <div className="editor__inner">
                <Editor styles={editor}
                        onChange={applyStyles}
                        showRegenerate={false}
                        showAddProperties={false}
                        hideResponsiveControls={true}>
                    <div>
                        <h3>Size</h3>
                        <Inputs.Width />
                        {/*<Inputs.Height />*/}
                        {/*<Inputs.AspectRatio key={"ASPECT"}></Inputs.AspectRatio>*/}
                        <h3>Spacing</h3>
                        {/*<Inputs.Margin />*/}
                        <Inputs.Padding />
                        <h3>Background</h3>
                        <Inputs.BackgroundColor key={"BG_COLOR"}></Inputs.BackgroundColor>
                        {/*<Inputs.Background key={"BG_IMAGE"}></Inputs.Background>*/}
                        <h3>Shadow</h3>
                        {/*<Inputs.BoxShadow  key={"SHADOW"}></Inputs.BoxShadow>*/}
                        <h3>Borders</h3>
                        {/*<Inputs.BorderRadius />*/}
                        {/*<Inputs.BorderWidth />*/}
                        {/*<Inputs.BorderStyle />*/}
                        {/*<Inputs.BorderColor />*/}
                        <h3>Font</h3>
                        {/*<Inputs.FontSize key={"FONT_SIZE"}></Inputs.FontSize>*/}
                    </div>
                </Editor>
            </div>
            <div className="preview">
                {/*<pre>{codegen.css(styles)}</pre>*/}
            </div>
        </div>
    )
}