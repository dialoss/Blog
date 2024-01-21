//@ts-nocheck
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import "./InfoParagraph.scss";
import {triggerEvent} from "helpers/events";
import InlineEditor from "../../components/InlineEditor/InlineEditor";
import {clearTextFromHTML} from "../TextEditor/helpers";
import store from "../../store";
import {pageEditable} from "../../modules/ItemList/store/reducers";
import {emptyItem, ItemElement} from "../ObjectTransform/ObjectTransform";


const InfoParagraph = ({type, children, id, ...props}) => {
    const ref = useRef();
    const [editor, setEditor] = useState({});
    useLayoutEffect(() => {
        setEditor({isOpened:false, value: children});
    }, [children]);
    function openEditor(event) {
        if (event.detail !== 2 || !pageEditable()) return;
        setEditor(e => ({...e, isOpened: true}));
    }
    function closeEditor(text) {
        if (text === null) {
            setEditor({isOpened: false, value: children});
            return;
        }
        let type = ref.current.classList[1].split('-')[1];
        let data: ItemElement = {type:''};
        if (['textfield', 'comment', 'message'].includes(type)) {
            data = {type, data:{text}};
        } else {
            if (!clearTextFromHTML(text)) text = '';
            data = {data: {[type]:text}, type:store.getState().elements.itemsAll[id].type};
        }
        data.id = id;
        window.actions.request('PATCH', data);
        setEditor({isOpened: false, value: text});
    }

    return (
        <span ref={ref} {...props} key={type}
              onClick={openEditor}
              className={`info__paragraph info__paragraph-${type}`}>
            {editor.isOpened ? <InlineEditor data={{
                    config: (type !== "price" ? 'editor' : 'simple'),
                    value: `<p>${editor.value}</p>`,
                    mount: ref,
                }} closeCallback={closeEditor}></InlineEditor> :
                editor.value && <div dangerouslySetInnerHTML={{__html: editor.value}}></div>}
        </span>
    );
};

export default InfoParagraph;