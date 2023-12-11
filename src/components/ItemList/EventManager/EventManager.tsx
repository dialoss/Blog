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

function splitItem(item: ItemElement) {
    const baseFields = {...item};
    if (baseFields.items) delete baseFields.items;
    if (baseFields.style) delete baseFields.style;
    if (baseFields.data) delete baseFields.data;
    return {base: baseFields, data: item.data || {}, style: item.style || {}};
}

const Verbose = {
    base: "Основная",
    data: "Данные",
    style: "Стиль"
}

const ItemsInfo = ({items, type, title}) => {
    const info = items.map(it => splitItem(it));
    console.log(info)
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
        triggerEvent("alert:trigger", {
            type:'loader',
            timeout: 100000,
        })
        sendLocalRequest('/api/backup/').then(r => {
            triggerEvent("alert:close");
            setTimeout(() => {
                if (r.success) triggerEvent("alert:trigger", {
                    type:'success',
                    body:'Дамп сохранен на почту',
                    timeout: 4000,
                })
                else triggerEvent("alert:trigger", {
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
        <div className={'page-editor'}>
            <ActionButton modalToggle={false} onClick={makeBackup}><Backup></Backup></ActionButton>
            <ActionButton modalToggle={false} onClick={setEdit}><Edit></Edit></ActionButton>
            <div className={"action-elements"}>
                <ItemsInfo items={[item]}
                           type={"focused"}
                           title={"Выделенный предмет"}></ItemsInfo>
                <ItemsInfo items={intermediate.filter(it => it.type === 'cut').map(it=>({id:it.item.id}))}
                           type={"cutted"}
                           title={"Вырезанные предметы"}></ItemsInfo>
                <ItemsInfo items={intermediate.filter(it => it.type === 'copy').map(it=>({id:it.item.id}))}
                           type={"copied"}
                           title={"Скопированные предметы"}></ItemsInfo>
                <Hierarchy data={Object.values(state)} config={{
                    childSelector: "items",
                    parentSelector: "parent",
                    recursiveComponent: ItemInfo,
                    componentDataProp: "data",
                    accordion: true,
                }}></Hierarchy>
            </div>
        </div>
    );
};

export default EventManager;