//@ts-nocheck
import {triggerEvent} from "helpers/events";
import {ActionData} from "./config";
import "./events.ts";
import {getFormData} from "../../ActionForm/helpers/FormData";
import {ElementActions, emptyItem, ItemElement} from "../../../ui/ObjectTransform/ObjectTransform";
import {ItemlistManager, manager} from "../../ItemList/components/ItemListContainer";
import store from "../../../store";
import {IPage} from "../../../pages/AppRouter/store/reducers";
import {actions} from "../../ItemList/store/reducers";
import {getSettings} from "./helpers";

function updateRequest(request: IRequest) : IRequest {
    if (request.method === 'DELETE') {
        request.method = 'POST';
    }
    if (request.method === 'POST') request.method = 'DELETE';
    return request;
}

export type Intermediate = {
    type: "cut" | "copy";
    className: "cutted" | "copied";
    item: ItemElement;
}

class HistoryManager {
    intermediate: Intermediate[] = [];
    history: IRequest[] = [];
    current = 0;

    undo() {
        if (this.current < 0) {
            this.current = 0;
        }
        let request = this.history[this.current];
        request = updateRequest(request);
        this.history.length && window.actions.itemlist.request(request);
        this.current -= 1;
    }

    redo() {
        if (!this.history.length) return;
        if (this.current >= this.history.length) {
            this.current = this.history.length - 1;
        }
        let request = this.history[this.current];
        request = updateRequest(request);
        window.actions.itemlist.request(request);
        this.current += 1;
    }

    clear() {
        this.history = [];
    }

    add(request: IRequest) {
        this.history.push(request);
    }
}

export type IRequest = {
    method: "POST" | "PATCH" | "DELETE";
    endpoint: "items" | "pages";
    item: ItemElement | IPage;
    instant: boolean;
}

interface IActions {
    itemlist: ItemlistManager;
    elements : ElementActions;
    history : HistoryManager;
    request(method: string, items: ItemElement[] | ItemElement, endpoint: string, instant: boolean);
    update();
    delete();
    create();
    copy();
    cut();
    paste();
    prepareItemForRequest(method: ('POST'|'DELETE'|'PATCH'), item: ItemElement) : ItemElement;
}

export default class Actions implements IActions{
    elements = new ElementActions();
    history = new HistoryManager();
    itemlist = manager;

    request(method: string, items: ItemElement[] | ItemElement, endpoint: string="items", instant=false) {
        if (!Array.isArray(items)) items = [items];
        console.log(method, items, endpoint);

        for (const item of items.map(it => this.prepareItemForRequest(method, it))) {
            let url = "/api/" + endpoint + "/";
            if (method !== 'POST') url += item.id + "/";

            const request: IRequest = {
                method,
                endpoint,
                item,
                instant,
            }
            this.itemlist.request(url, request);
            this.history.add(request);
        }
    }

    create(item='') {
        let data = ActionData[item];
        if (!data) {
            window.callbacks.call("element-form", getFormData("POST", {type: item}));
            return;
        }
        let parent = this.elements.focused && (this.elements.focused.type !== 'page' ? this.elements.focused.id : null);
        this.request('POST', ({parent, ...data}));
    }

    update(item='') {
        const focused = this.elements.focused;
        if (!item) {
            window.callbacks.call("element-form", getFormData('PATCH', focused));
            return;
        }
        this.request('PATCH', {...focused, ...getSettings(item, focused.style)});
    }

    baseAction(type: ('copy'|'cut'), name: ('copied'|'cutted')) {
        let elements: ItemElement[] = [...this.elements.selected];
        if (!elements.length) elements = [this.elements.focused];
        elements.forEach(el => {
            this.elements.addStyle(el, name);
            this.history.intermediate.push({
                className: name,
                type: type,
                item: el,
            })
        });
        store.dispatch(actions.setField({field:"intermediate", data:this.history.intermediate}));
    }

    copy() {
       this.baseAction('copy', 'copied');
    }

    cut() {
        this.baseAction('cut', 'cutted');
    }

    paste() {
        let historyData = this.history.intermediate;
        if (!historyData) return [];
        this.history.intermediate.forEach(hs => this.elements.clearStyle(hs.item, hs.className));
        this.history.intermediate = [];
        store.dispatch(actions.setField({field:"intermediate", data:[]}));

        let action = this.elements.focused;

        let items: ItemElement[] = [];
        historyData.forEach(hs => {
            items.push({
                ...hs.item,
                parent: action.id,
            });
            if (hs.type === 'cut') this.delete([hs.item]);
        });
        historyData.forEach(hs => this.elements.clearStyle(hs.item, hs.className));
        this.request('POST', items);
    }

    delete(elements: ItemElement[]=[]) {
        let force = elements.length > 0;
        if (!elements.length) elements = this.elements.selected;
        if (!elements.length) elements = [this.elements.focused];
        if (force) return this.request('DELETE', elements);
        window.callbacks.call("user-prompt", {title: "Подтвердить удаление", button: 'ок', submitCallback: (submit) => {
            if (!!submit) this.request('DELETE', elements);
        }});
    }

    prepareItemForRequest(method: ('POST'|'DELETE'|'PATCH'), item: ItemElement={}) : ItemElement {
        let baseData = {};
        if (!item.id && method === "PATCH") baseData = this.elements.focused;
        if (item.parent === undefined && method === "POST" && item.type !== 'page') item.parent = this.elements.focused.id;
        if (item.style && typeof item.style !== 'string') item.style = JSON.stringify({
            css: JSON.stringify(item.style),
        });
        return {
            ...baseData,
            ...item,
            tab: store.getState().location.tab,
            page: store.getState().location.currentPage,
        };
    }
}

export class Callbacks {
    callbacks = {};
    register(name: string, callback: any) {
        console.log(this)
        this.callbacks[name] = callback;
    }
    call(name: string, data: any={}) {
        console.log('CALLBACK', name, data, this)
        if (name in this.callbacks)
            return this.callbacks[name](data);
    }
}

declare global {
    interface Window {
        actions: Actions;
        callbacks: Callbacks;
    }
}