import React, {useCallback, useLayoutEffect, useReducer, useRef, useState} from 'react';
import Carousel from "./components/Carousel/Carousel.jsx";
import useKeypress from "react-use-keypress";
import {triggerEvent} from "helpers/events";
import {useAddEvent} from "hooks/useAddEvent";
import {useSelector} from "react-redux";
import {ModalManager} from "components/ModalManager";

function bounds(n, bound) {
    return (n + bound) % bound;
}

const CarouselContainer = () => {
    const items = useSelector(state => state.elements.items);
    const [content, setContent] = useState([]);
    const contentRef = useRef();
    contentRef.current = content;
    const openedRef = useRef();

    const [currentItem, setCurrent] = useState(0);

    const forward = useCallback(() => {
        openedRef.current = false;
        setCurrent(currentItem => bounds(currentItem + 1, contentRef.current.length));
    }, []);
    const back = useCallback(() => {
        openedRef.current = false;
        setCurrent(currentItem => bounds(currentItem - 1, contentRef.current.length));
    }, []);

    const windowName = 'carousel-window:toggle';

    const openCarousel = useCallback(event => {
        for (let i = 0; i < contentRef.current.length; i++) {
            if (contentRef.current[i].id === event.detail) {
                setCurrent(i);
                triggerEvent(windowName, {isOpened: true});
                return;
            }
        }
        openedRef.current = true;
        setContent([{...event.detail, navigation: false}]);
        setCurrent(0);
        triggerEvent(windowName, {isOpened: true});
    }, []);

    useAddEvent("carousel:open", openCarousel);
    useAddEvent("carousel:right", forward);
    useAddEvent("carousel:left", back);

    useLayoutEffect(() => {
        let newContent = [];
        items.forEach(item => {
            item.items.forEach(item => {
                if (item.type !== 'image') return;
                newContent.push({
                    navigation: true,
                    id: item.id,
                    url: item.url,
                    info: {
                        title: item.title || item.title,
                        description: item.description || item.description,
                        filename: item.file,
                    }
                });
            })
        })
        setContent(newContent);
    }, [items]);

    const [carouselChanged, setChanged] = useState('default');
    const [item, setItem] = useState(null);
    useLayoutEffect(() => {
        if (!content.length) return;
        if (openedRef.current) {
            setItem(content[currentItem]);
            return;
        }
        setChanged('changed');
        setTimeout(() => {
            setChanged('default');
        }, 100);
        setTimeout(() => {
            setItem(content[currentItem]);
        }, 50);
    }, [currentItem, content]);

    useKeypress('ArrowRight', () => triggerEvent('carousel:right'));
    useKeypress('ArrowLeft', () => triggerEvent('carousel:left'));
    return (
        <>
            {!!item &&
                <ModalManager name={windowName} key={windowName}>
                    <Carousel className={carouselChanged} style={{win: 'centered'}} item={item}/>
                </ModalManager>
            }
        </>
    );
};

export default CarouselContainer;