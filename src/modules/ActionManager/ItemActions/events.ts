//@ts-nocheck

import store from "../../../store";

window.addEventListener('keydown', e => {
    console.log(e)
    if(e.target.nodeName == "INPUT" ||
        e.target.nodeName == "TEXTAREA" ||
        e.target.isContentEditable ||
        window.modals.hasOpened() ||
        !store.getState().elements.editPage) return;
    if (e.ctrlKey) {
        switch (e.code) {
            case 'KeyZ':
                return window.actions.history.undo();
            case 'KeyY':
                return window.actions.history.redo();
            case 'KeyC':
                return window.actions.copy();
            case 'KeyX':
                return window.actions.cut();
            case 'KeyV':
                return window.actions.paste();
            case 'KeyQ':
                return window.actions.history.clear();
        }
    }
    if (e.key === 'Delete') {
        window.actions.delete();
    }
})