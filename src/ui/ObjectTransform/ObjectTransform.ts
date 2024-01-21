//@ts-nocheck
import {getTransformData, setItemTransform, transformItem} from "./transform";
import {initContainerDimensions} from "./helpers";
import {actions} from "../../modules/ItemList/store/reducers";
import store from "../../store";
import {IPage} from "../../pages/AppRouter/store/reducers";
import {getElementFromCursor} from "../../helpers/events";

export interface ItemElement {
    id?: number;
    type: string;
    parent?: number | null;
    tab?: number;
    order?: number;
    items?: ItemElement[];
    page?: IPage;
    date_created?: string;
    movable?: boolean;
    resizable?: boolean;
    class_name?: string;
    data?: {
        [key: string]: number | string | boolean;
    },
    style?: string | object;
}

export const emptyItem: ItemElement = {
    type: "base",
    tab: 0,
    order: 0,
    items: [],
};

export interface IElementActions {
    clickCount: number;
    focused: ItemElement | IPage;
    selected: ItemElement[];
    transformed: ItemElement;

    init(event, origin: HTMLElement, type: "move" | "resize");
}

export class ElementActions implements IElementActions {
    clickCount = 0;
    focused = null;
    selected = [];
    transformed = null;

    iterateItems(func, item, style) {
        let index = 0;
        let it = item;
        while (it) {
            if (index === 0) {
                func(it, style);
            }
            it = it.closest('.item');
            if (!it) break;
            it = it.closest('.transform-item');
            if (!it) break;
            func(it, style + "-parent");
            index++;
        }
    }

    static getElement(item: HTMLElement | ItemElement) : HTMLElement {
        if (!(item instanceof HTMLElement)) return document.querySelector(`.transform-item[data-id="${item.id}"]`);
        return item as HTMLElement;
    }

    clearStyle(item: any, style: string) {
        ElementActions.getElement(item).classList.remove(style);
    }

    addStyle(item: any, style: string) {
        ElementActions.getElement(item).classList.add(style);
    }

    selectItems(item: HTMLElement, event) {
        if (!item) return;
        let style = "focused";
        if (event.ctrlKey) {
            style = "selected";
            let alreadySelected = false;
            for (const it of this.selected) {
                if (this.focused && it.id === this.focused.id) alreadySelected = true;
            }
            if (alreadySelected) {
                this.iterateItems(this.clearStyle, ElementActions.getElement(this.focused), style);
                this.selected = this.selected.filter(it => it.id !== this.focused.id);
            }
            else this.selected.push(this.focused);
        } else {
            this.focused && this.iterateItems(this.clearStyle, ElementActions.getElement(this.focused), style);
        }
        this.iterateItems(this.addStyle, item, style);
        let type = item.getAttribute("data-type");
        let items = {};
        if (type === 'page') {
            items = store.getState().location.pages;
        } else {
            items = store.getState().elements.itemsAll;
        }
        this.focused = {...items[+item.getAttribute('data-id')]};

        store.dispatch(actions.setField({field: "focused", data: this.focused}));
        console.log('ACTION',this.focused, this.selected, this)
    }

    init(event, origin: HTMLElement, type: "move" | "resize") {
        let item: HTMLElement = origin.closest(".transform-item");
        if (this.transformed || type==='move' && item.getAttribute("data-type") === 'section') return;

        let alreadyFocused;
        if (item.getAttribute('data-type') !== 'modal') {
            alreadyFocused = this.focused && this.focused.id === +item.getAttribute('data-id');
            // if (!alreadyFocused) this.clickCount = 0;
            // let clicks = this.clickCount;
            // while (item.parentElement.closest('.transform-item') && clicks > 0 && alreadyFocused) {
            //     item = item.parentElement.closest('.transform-item');
            //     clicks--;
            //     console.log(clicks, item)
            // }
            // this.selectItems(item, event);
        } else {
            alreadyFocused = true;
        }
        this.clickCount++;
        if (alreadyFocused) setItemTransform(event, type, item, origin, {
            onSwipeEnd: (d) => {
                this.clickCount--;
                if (d.item.getAttribute('data-type') === 'modal') return;
                getTransformData(d);
            },
            onSwipeStart: data => {
                transformItem(data);
            },
        });
    }

    selectFromCursor(event) {
        this.selectItems(getElementFromCursor(event, "transform-item"), event);
    }

    initContainer(container) {
        initContainerDimensions(container);
    }
}