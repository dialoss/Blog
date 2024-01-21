//@ts-nocheck

import {ItemElement} from "../../../ui/ObjectTransform/ObjectTransform";

export const DefaultEdit : IContextAction = {
    'clear_position': {
        callback: 'update',
        argument: true,
        text: 'Сбросить расположение',
    },
    'clear_size': {
        callback: 'update',
        argument: true,
        text: 'Сбросить размер',
    },
}

export interface IContextAction {
    [key: string]: {
        text: string,
        callback?: string | (() => void);
        argument?: boolean,
        stay_opened?: boolean,
        actions?: IContextAction;
    }
}

export const ContextActions : IContextAction = {
    'create':{
        text: 'Добавить',
        argument: true,
        stay_opened: true,
        actions: {
            'quiz': {
                callback: "create",
                argument: true,
                text: "Квиз",
            },
            'print': {
                callback: "create",
                argument: true,
                text: "Гравюра",
            },
            'section': {
                callback: "create",
                argument: true,
                text: "Секция",
            },
            'quick': {
                callback: 'create',
                argument: true,
                text: 'Новая запись',
            },
            'empty': {
                callback: 'create',
                argument: true,
                text: 'Пустая',
            },
            'textfield': {
                callback: 'create',
                argument: true,
                text: 'Текстовое поле',
            },
            'button': {
                callback: 'create',
                argument: true,
                text: 'Кнопка',
            },
            'show_more': {
                text: 'Ещё',
                stay_opened: true,
                actions: {
                    'tabs': {
                        callback: 'create',
                        argument: true,
                        text: 'Вкладки',
                    },
                    'intro': {
                        callback: 'create',
                        argument: true,
                        text: 'Шапка',
                    },
                    'shop': {
                        callback: 'create',
                        argument: true,
                        text: 'Продажа',
                    },
                    'timeline': {
                        callback: 'create',
                        argument: true,
                        text: 'Таймлайн',
                        actions: {
                            'timeline_entry': {
                                callback: 'create',
                                argument: true,
                                text: 'Запись',
                            },
                        }
                    },
                    'price': {
                        callback: 'create',
                        argument: true,
                        text: 'Цена',
                    },
                    'page': {
                        callback: 'create',
                        argument: true,
                        text: 'Страница'
                    },
                    'navigation': {
                        callback: 'create',
                        argument: true,
                        text: 'Навигация'
                    }
                }
            },
        }
    },
    'update':{
        text: 'Редактировать',
        argument: false,
        actions: {},
    },
    'media': {
        text: 'Медиа',
        actions: {
            'storage': {
                callback: () => window.modals.toggle("filemanager"),
                text: 'Хранилище',
            },
            'local': {
                callback: () => window.filemanager.local(),
                text: 'Локально',
            },
        }
    },
    'copy':{
        argument: false,
        text: 'Копировать',
    },
    'paste':{
        argument: false,
        text: 'Вставить',
    },
    'cut':{
        argument: false,
        text: 'Вырезать',
    },
    'delete':{
        argument: false,
        text: 'Удалить',
    }
}
// argument - null not callback, false no need arg, true pass name as argument
// if callback - function with  name of this value - else function with action name


interface IActionData {
    [key: string] : ItemElement;
}

export const ActionData: IActionData = {
    section: {
        type: "section",
        style: {
            aspectRatio: "1 / 1",
            boxShadow:"none",
            padding: "0 0 0 0",
        }
    },
    page_from: {
        type: 'page_from',
    },
    button: {
        type: 'button',
        data: {
            style: "nav",
            text: 'Кнопка',
        }
    },
    textfield: {
        type: 'textfield',
        data: {
            text: "Текстовое поле"
        }
    },
    empty: {
        type: 'base',
        data: {
            class_name: "masonry masonry_1"
        },
        style: {
            movable: false,
            width: '1200px',
            height: "50px",
        }
    },
    quick: {
        type: 'base',
        data: {
            show_date: true,
            description: 'Описание',
            title: 'Заголовок',
        },
        style: {
            width: '1200px',
        }
    },
    tabs: {
        type: 'base',
        style: {
            movable: false
        },
        data: {
            style: "tabs"
        },
        items: [
            {
                style: {
                    width: "35%",
                    height: "52.75px"
                },
                data: {
                    style: "nav",
                    text: "текст",
                    link: "$tab_0"
                },
                items: [],
                type: "button"
            },
            {
                style: {
                    width: "35%",
                    height: "52.75px"
                },
                data: {
                    style: "nav",
                    text: "текст",
                    link: "$tab_1"
                },
                items: [],
                type: "button"
            }
        ],
    },
    intro: {
        items: [
            {
                style: {
                    width: "100%"
                },
                items: [
                    {
                        style: {
                            width: "100%",
                            height: "850px"
                        },
                        items: [
                            {
                                style: {
                                    width: "70%",
                                    height: "100px",
                                    top: "60px",
                                    left: "0px",
                                    boxShadow: "none"
                                },
                                data: {
                                    movable: false,
                                    position: "absolute"
                                },
                                items: [],
                                type: "subscription",
                                order: 1
                            },
                            {
                                style: {
                                    width: "50%",
                                    top: "50px",
                                    left: "50%",
                                    boxShadow: "none"
                                },
                                data: {
                                    position: "absolute"
                                },
                                items: [
                                    {
                                        style: {
                                            boxShadow: "none",
                                            width: "100%",
                                            height: "100px",
                                        },
                                        data: {
                                            movable: false,
                                            text: "<h1>Заголовок</h1>"
                                        },
                                        items: [],
                                        type: "textfield"
                                    },
                                    {
                                        style: {
                                            boxShadow: "none",
                                            width: "100%",
                                            height: "660px",
                                        },
                                        data: {
                                            movable: false,
                                            text: "Описание"
                                        },
                                        items: [],
                                        type: "textfield"
                                    }
                                ],
                                type: "subscription",
                                order: 2
                            }
                        ],
                        type: "base"
                    }
                ],
                type: "base"
            },
            {
                style: {
                    width: "100%",
                    height: "400px"
                },
                data: {},
                items: [
                    {
                        style: {
                            width: "100%",
                            height: "300px"
                        },
                        data: {
                            url: "1TT6KWUcn4_4shc-DK--2JDR4W4_nUuPT"
                        },
                        items: [],
                        type: "file"
                    }
                ],
                type: "base"
            },
            {
                style: {
                    width: "100%",
                    height: "80px"
                },
                data: {},
                items: [
                    {
                        style: {
                            width: "100%"
                        },
                        data: {
                            style: "action",
                            text: "Заказать изготовление",
                            link: "$order",
                            price: "<p>от 160000</p>"
                        },
                        items: [],
                        type: "button"
                    }
                ],
                type: "base"
            }
        ],
        type: "base"
    },
    shop: {
        items: [
            {
                style: {
                    width: "50%",
                    height: "100px",
                    boxShadow: "none",
                },
                movable: false,
                items: [],
                type: "subscription"
            },
            {
                style: {
                    width: "50%",
                    height: "100px",
                    boxShadow: "none",
                },
                movable: false,
                items: [
                    {
                        style: {
                            width: "100%",
                            boxShadow: "none",
                        },
                        data: {
                            title: "Заголовок",
                            description: "Описание"
                        },
                        items: [],
                        movable: false,
                        type: "subscription"
                    },
                    {
                        style: {
                            width: "100%",
                            boxShadow: "none",
                            movable: false
                        },
                        data: {
                            price: "999",
                            style: "action",
                            text: "Приобрести",
                            link: "$buy"
                        },
                        items: [],
                        type: "button"
                    }
                ],
                type: "subscription"
            }
        ],
        type: "base"
    },
    timeline: {
        style: {
            boxShadow: "none",
            width: "100%"
        },
        data: {},
        items: [
            {
                style: {
                    background: "#f00",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Подготовка материала"
                },
                items: [],
                type: "timeline_entry"
            },
            {
                style: {
                    background: "#e2b624",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Изготовление деталей"
                },
                items: [],
                type: "timeline_entry"
            },
            {
                style: {
                    background: "#0932ae",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Сборка"
                },
                items: [],
                type: "timeline_entry"
            },
            {
                style: {
                    background: "#710dd5",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Тестирование"
                },
                items: [],
                type: "timeline_entry"
            },
            {
                style: {
                    background: "#3ddf20",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Упаковка"
                },
                items: [],
                type: "timeline_entry"
            },
            {
                style: {
                    background: "#005102",
                    boxShadow: "none",
                    movable: false
                },
                data: {
                    title: "Отправлено"
                },
                items: [],
                type: "timeline_entry"
            }
        ],
        type: "timeline"
    },
    price: {
        type:"button",
        style: {},
        data: {
            price: "999",
            text: "Приобрести",
            link: "$buy",
            style: "action"
        },
        items: []
    },
    navigation: {
        style: {
            movable: false
        },
        data: {
            style: "tabs"
        },
        items: [
            {
                style: {},
                data: {
                    style: "nav",
                    text: "Главная",
                    link: "/main/"
                },
                items: [],
                type: "button"
            },
            {
                style: {},
                data: {
                    style: "nav",
                    text: "модели",
                    link: "/models/"
                },
                items: [],
                type: "button"
            },
            {
                style: {},
                data: {
                    style: "nav",
                    text: "заказы",
                    link: "/orders/"
                },
                items: [],
                type: "button"
            },
            {
                style: {},
                data: {
                    style: "nav",
                    text: "детали",
                    link: "/parts/"
                },
                items: [],
                type: "button"
            },
            {
                style: {},
                data: {
                    style: "nav",
                    text: "чертежи",
                    link: "/blueprints/"
                },
                items: [],
                type: "button"
            },
            {
                style: {},
                data: {
                    style: "nav",
                    text: "в продаже",
                    link: "/shop/"
                },
                items: [],
                type: "button"
            }
        ],
        type: "base"
    }
}