//@ts-nocheck
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Modal from "ui/Modal/Modal";
import {isMobileDevice} from "../../../helpers/events";

interface IModal {
    name: string;
    zindex: number;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IModals {
    top: IModal;
    opened: IModal[];
    all: {
        [key: string]: IModal
    }
    overlays: string[];
    open(name: string);
    close(name: string, checkOverlay: boolean);
    toggle(name: string, state);
    checkState(name: string) : boolean;
    add(modal: IModal);
    hasOpened(): boolean;
}

class Modals implements IModals {
    top = null;
    all = {};
    opened = [];
    overlays = [];
    max() {
        let m: IModal;
        for (const modal in this.opened) {
            if (!m || this.opened[modal].zindex > m.zindex) {
                m = this.opened[modal];
            }
        }
        return m || {zindex: 11};
    }
    open(name: string) {
        console.log('OPEN',name, this)
        this.top = this.all[name];
        this.top.zindex = this.max().zindex + 1;
        this.opened.push(this.top);
        this.overlayBody(true);
        this.all[name].setOpened(true);
    }
    close(name: string, checkOverlay: boolean=false) {
        if (checkOverlay && this.top.zindex !== this.all[name].zindex) return;
        console.log('CLOSE',name, this)

        this.all[name].setOpened(false);
        setTimeout(() => {
            this.overlayBody(false);
            this.opened.splice(this.opened.indexOf(this.top), 1);
            this.top = this.max();
        }, 10);
    }
    checkState(name: string) {
        return this.opened.find(m => m.name === name);
    }
    overlayBody(opened) {
        if (isMobileDevice() && this.top.name.match(/messenger|carousel|filemanager|element|login/)) {
            if (opened) {
                document.body.classList.add('overlayed');
                this.overlays.push(this.top.name);
            }
            if (!opened) {
                this.overlays.pop();
                !this.overlays.length && document.body.classList.remove('overlayed');
            }
        }
    }
    add(modal: IModal) {
        this.all[modal.name] = modal;
    }
    toggle(name: string, state=undefined) {
        console.log('TOGGLE', name)
        if (state !== undefined) {
            if (!state) this.close(name);
            else this.open(name);
        } else {
            if (this.checkState(name)) this.close(name);
            else this.open(name);
        }
    }
    hasOpened(): boolean {
        return this.opened.length > 0;
    }
}

declare global {
    interface Window {
        modals: Modals;
    }
}
const modals = new Modals();

window.modals = modals;


interface ModalProps {
    name: string;
    children?: React.ReactNode;
    closeConditions: string[];
    defaultOpened?: boolean;
    style: {
        bg?: 'bg-none' | '',
        win?: 'centered' | 'bottom' | '',
    }
}

const ModalManager = ({name, children, style={},
                          defaultOpened=false,
                          closeConditions=['btn', 'bg', 'esc']} : ModalProps) => {
    const [isOpened, setOpened] = useState(defaultOpened);
    const openRef = useRef<boolean>(false);
    openRef.current = isOpened;

    useLayoutEffect(() => {
        modals.add({
            name,
            setOpened,
            zindex: 10,
        });
    }, []);

    useLayoutEffect(() => {
        setOpened(defaultOpened);
    }, [defaultOpened]);

    function backgroundClick() {
        closeConditions.includes('bg') && openRef.current && modals.close(name, true);
    }

    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (closeConditions.includes('btn')) {
            const closeButton = ref.current.querySelector(".window-close");
            closeButton && closeButton.addEventListener("click", () => modals.close(name));
        }
        if (closeConditions.includes('esc')) window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.close(name, true)
            }
        });
    }, [closeConditions]);

    useEffect(() => {
        if (isOpened && modals.top) {
            let front = modals.top.zindex;
            ref.current.style.zIndex = front;
            const item : HTMLElement = ref.current.querySelector('.transform-item');
            item && (item.style.zIndex = front);
            ref.current.querySelector('.modal__window').style.zIndex = front;
        }
    }, [isOpened]);

    return (
        <div className={"modal-manager"} ref={ref} style={{position:'fixed', pointerEvents:'none'}}>
            <Modal content={children}
                   name={name}
                   style={style}
                   isOpened={isOpened}
                   closeCallback={backgroundClick}
                   key={name}></Modal>
        </div>
    );
}

export default ModalManager;