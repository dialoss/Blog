//@ts-nocheck

function getFirstItems(container) {
    let items = container.querySelector('.items-wrapper');
    if (items) return items.querySelectorAll(':scope > .transform-item');
    return [];
}

export function isResizable(item) {
    return !item.getAttribute('data-type').match(/image|model|video/);
}

function getMaxBottom(container) {
    let m = 0;
    for (const block of getFirstItems(container)) {
        let rect = block.getBoundingClientRect();
        m = Math.max(m, block.offsetTop + rect.height);
    }
    if (container.style.aspectRatio !== 'auto') {
        return Math.max(m, container.getBoundingClientRect().height);
    }
    // if (!isResizable(container)) m = Math.max(m, )
    // if (container.getAttribute('data-height')) {
    //     const dataHeight = +container.getAttribute('data-height').replace('px', '');
    //     if (dataHeight && m < dataHeight &&
    //         !['timeline'].includes(container.getAttribute('data-type'))) {
    //         m = dataHeight;
    //     }
    // }
    return m;
}
export function initContainerDimensions(container: HTMLElement, resize=false) {
    if (!container) return;
    let contHeight = getMaxBottom(container);
    // console.log(contHeight)
    // if (!isResizable(container) && item) {
    //     let itemBlock = item.getBoundingClientRect();
    //     let contBlock = container.getBoundingClientRect();
    //     if (item.offsetTop + itemBlock.height > contBlock.height)
    //         item.style.top = Math.max(0, contBlock.height - itemBlock.height) + 'px';
    //     return;
    // }
    container.style.aspectRatio = container.getBoundingClientRect().width / contHeight;
    if (!resize) {
        let parentContainer = container.parentElement.closest('.transform-item');
        parentContainer && initContainerDimensions(parentContainer);
    }
}

export function preventOnTransformClick(ref) {
    const itemTransform = ref.current.closest(".transform-item");
    if (!!itemTransform && Array.from(itemTransform.classList).slice(-1)[0] === 'transformed') {
        itemTransform.classList.remove("transformed");
        return true;
    }
    return false;
}