//@ts-nocheck
import React from 'react';
import {useAddEvent} from "../../../hooks/useAddEvent";
import store from "../../../store";
import {actions} from "../../../modules/ItemList/store/reducers";
import ActionButton from "../../../ui/Buttons/ActionButton/ActionButton";
import "./EventManager.scss";
import {sendLocalRequest} from "../../../api/requests";
import {triggerEvent} from "../../../helpers/events";
import {ReactComponent as Edit} from "./edit.svg";
import {ReactComponent as Backup} from "./backup.svg";
import {useAppSelector} from "hooks/redux";
import {ItemElement} from "../../../ui/ObjectTransform/ObjectTransform";
import {Intermediate} from "../../../modules/ActionManager/ItemActions/actions";
import Hierarchy from "../../../ui/Hierarchy/Hierarchy";
import AccordionContainer from "../../../ui/Accordion/AccordionContainer";
import {ItemsVerbose} from "../../../modules/ActionForm/helpers/config";
import {CSSEditor} from "../CSSEditor/CSSEditor";
import {parse} from "../../Item/Item";
import Slider from "../../../ui/Slider/Slider";
import WindowButton from "../../../ui/Buttons/WindowButton/WindowButton";
import ToggleButton from "../../../ui/Buttons/ToggleButton/ToggleButton";
import {ReactComponent as IconChevronRight} from "../../../ui/Iconpack/icons/chevron-right.svg";

function splitItem(item: ItemElement) {
    const baseFields = {...item};
    for (const field of ["items","style","data","page"]){
        if (baseFields[field]) delete baseFields[field];
    }
    return {base: baseFields, data: item.data || {}};
}

const Verbose = {
    base: "Основная",
    data: "Данные",
}

const ItemsInfo = ({items, type, title}) => {
    const info = items.map(it => splitItem(it));
    return (
        <div className={type}>
            {!!items.length && <h3>{title}</h3>}
            <div className="info">
                {
                    info.map(it =>
                        Object.keys(it).map(k => <>
                            <h5>{Verbose[k]}</h5>
                            <div className={k}>
                                {
                                    Object.keys(it[k]).map(f =>
                                        <p>{f}: {it[k][f]}</p>
                                    )
                                }
                            </div>
                            </>
                        )
                    )
                }
            </div>
        </div>
    );
}

const ItemInfo = ({data, children}) => {
    return (
        <div className={"info"}>
            <AccordionContainer title={data.type}>
                {children}
            </AccordionContainer>
        </div>
    );
}

let interval = null;

function setItemStyle(style) {
    const item = window.actions.elements.focused;
    if (!item || item.type === 'page') return;
    if (interval) clearInterval(interval);
    window.actions.request("PATCH", {...item, style}, 'items', true);
    interval = setInterval(() => {
        window.actions.request("PATCH", {...item, style});
        clearInterval(interval);
    }, 5000);
}

const EventManager = () => {
    function setEdit() {
        const current = store.getState().elements.editPage;
        store.dispatch(actions.setField({field:'editPage', data: !current}));
    }
    useAddEvent('keydown', e => {
        if (e.ctrlKey && e.altKey && e.code === 'KeyE') setEdit();
        if (e.ctrlKey && e.code === 'KeyS') {
            e.preventDefault();
            makeBackup();
        }
    })
    function makeBackup() {
        const id = window.alerts.open({
            type:'loader',
            timeout: 100000,
        });
        sendLocalRequest('/api/backup/').then(r => {
            window.alerts.close(id);
            setTimeout(() => {
                if (r.success) window.alerts.open({
                    type:'success',
                    body:'Дамп сохранен на почту',
                    timeout: 4000,
                });
                else window.alerts.open({
                    type:'error',
                    body:"Ошибка сохранения",
                    timeout: 2000,
                })
            }, 300);
        });
    }
    const elements = useAppSelector(state => state.elements);
    const item = elements.focused;
    const intermediate: Intermediate[] = elements.intermediate;
    const state = useAppSelector(state => state.elements.pageItems);
    return (
        <div className={'page-editor'} onMouseDown={e => e.stopPropagation()}>
            <div className="buttons">
                <ActionButton modalToggle={false} onClick={makeBackup}><Backup></Backup></ActionButton>
                <ActionButton memorizeState={true} modalToggle={false} onClick={setEdit}><Edit></Edit></ActionButton>
                <p>{item.id}</p>
            </div>
        </div>
    );
};

export default EventManager;