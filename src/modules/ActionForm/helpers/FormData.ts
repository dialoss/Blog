//@ts-nocheck

import formData from './data.json';
import allFields from './all.json';
import {FieldsOrder, ItemsVerbose} from "./config";
import {ItemElement} from "../../../ui/ObjectTransform/ObjectTransform";
import {IPage} from "../../../pages/AppRouter/store/reducers";

export class FormSerializer {
    fields: IFormSerialized;
    form: IForm;
    constructor(form: IForm, fields: IFormFields) {
        let newFields = {};
        for (const f in fields) {
            newFields[f] = fields[f].value;
        }
        this.fields = newFields;
        this.form = form;
    }
    serialize() : object {
        return this.fields;
    }
}

class ItemSerializer extends FormSerializer {
    constructor(...args) {
        super(...args);
    }
    serialize() {
        if (this.fields.url) {
            if (this.form.method === 'POST') {
                this.fields.items = structuredClone(newFields.url);
                delete this.fields.url;
            } else {
                // for (const field of ['width', 'height', 'filename', 'type']) {
                //     this.fields[field] = this.fields.url[0][field] || this.fields[field];
                // }
                // this.fields.url = this.fields.url[0].url;
            }
        }
        if (this.fields.page_from !== undefined) {
            if (!this.fields.page_from) delete this.fields.page_from;
            else this.fields.page_from = {path:this.fields.page_from};
        }
        return {
            ...this.form.item,
            ...this.fields,
            data: {...this.fields},
        };
    }
}

class PageSerializer extends FormSerializer {
    constructor(...args) {
        super(...args);
    }
    serialize() {
        return {
            ...this.form.item,
            ...this.fields
        };
    }
}

function getFieldData(field: string, item: ItemElement | IPage) {
    let flatItem = {
        ...item,
        ...item.data,
    }
    if (field === 'url') {
        if (!['video', 'image', 'model', 'file'].includes(flatItem.type)) return [];
        return [{
            type: flatItem.type,
            id: flatItem.id,
            url: flatItem.url,
            filename: flatItem.filename,
        }];
    }
    if (field === 'page_from' && flatItem[field]) return flatItem[field].path;
    return flatItem[field];
}

function serializeValue(value, type) {
    if (type === 'checkbox') return !!value;
    return value;
}

export function mapFields(fields) {
    return fields.map(f => allFields[f]);
}

export type IFormField = {
    name: string;
    type: "input" | "textarea" | "checkbox" | "color" | "slider" | "upload";
    validate?: string;
    attrs?: ['required'];
    label: string;
    autocomplete?: string;
    value: string | boolean | number;
    [key: string] : number;
}

export type IFormSerialized = {
    [key: string] : string | number | boolean;
}

export type IFormFields = {
    [key: string] : IFormField;
}

export type IForm = {
    button: string;
    method: "POST" | "PATCH";
    title: string;
    data: IFormFields;
    submitCallback?: (...args: any[]) => any;
    windowButton?: boolean;
    style: "inline" | "default";
    item?: ItemElement;
}

export function createForm(data, fields: IFormField) : IForm {
    return {
        submitCallback: fields => console.log(fields),
        windowButton: false,
        style: 'default',
        data: fields,
        ...data,
    }
}

export function getFormData(method: "POST" | 'PATCH', item: ItemElement, extraFields: IFormField[]=[], initialData={}) {
    let type = item.type;
    let fieldsRaw = [...mapFields(formData[type]), ...mapFields(extraFields)];
    let orderedFields = [];
    let otherFields = [];
    for (const f of FieldsOrder) {
        fieldsRaw.forEach(field => {
            if (field.name === f) orderedFields.push(field);
            else otherFields.push(field);
        })
    }
    let fields: IFormField[] = [...orderedFields,...otherFields];

    let form: IForm = {
        method,
        title: (method === 'PATCH' ? 'Редактировать ' : 'Добавить ') + (ItemsVerbose[type].text || ''),
        button: 'ok',
        data: {},
        item,
        submitCallback: fields => {
            if (!fields) return;
            let data: IPage | ItemElement = {type};
            if (type === "page") data = new PageSerializer(form, fields).serialize();
            else data = new ItemSerializer(form, fields).serialize();
            console.log(data)
            window.actions.request(form.method, data, type === 'page' ? "pages" : "items");
        },
        windowButton: true,
        style: "default",
    };

    const getValue = (field) => serializeValue((method !== 'POST' ? getFieldData(field.name, item) :
        (initialData[field.name] !== undefined ? initialData[field.name] :
            (field.initial === null ? '' : field.initial))), field.type);

    fields.forEach((field) => {
        form.data[field.name] = {value: getValue(field), ...field};
    });
    console.log(fieldsRaw)
    return form;
}