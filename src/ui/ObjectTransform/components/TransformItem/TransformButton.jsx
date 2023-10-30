import React, {useEffect, useRef} from 'react';
import {triggerEvent} from "helpers/events";

const TransformButton = ({children, type, ...props}) => {
    const ref = useRef();
    function transformCallback(event) {
        event.stopPropagation();
        if (event.button !== 0) return;
        triggerEvent("transform:init", {event, type, btn:ref.current});
    }

    useEffect(() => {
        if (type === 'move') ref.current.querySelector(".transform-origin").addEventListener('mousedown', transformCallback);
        else ref.current.addEventListener('mousedown', transformCallback);
    }, []);

    return (
        <div {...props} ref={ref}>
            {children}
        </div>
    );
};

export default TransformButton;