//@ts-nocheck
import React, {useEffect, useRef} from 'react';
import './Item.scss';
import ItemData from "./components/ItemData";
import TransformItem from "../../ui/ObjectTransform/components/TransformItem/TransformItem";
import MyMasonry from "../../ui/Masonry/MyMasonry";
import {ItemElement} from "../../ui/ObjectTransform/ObjectTransform";
// import Carousel from "../../ui/gravur/Carousel";

interface ItemProps {
    item: ItemElement;
    depth: number;
}

export const SimpleItem = ({item, depth=0}: ItemProps) => {
    const itemData = <ItemData data={{...item.data, type: item.type, id: item.id}}></ItemData>;

    let items = item.items.sort((a,b)=>a.order-b.order).map(item => <Item depth={depth + 1} item={item} key={item.id}></Item>);
    if (item.class_name) {
        if (item.class_name.match(/masonry/)) items = <MyMasonry
            maxColumns={+item.class_name.split("_")[1]}>{items}</MyMasonry>;
        // if (item.class_name. match(/carousel/)) items = <Carousel items={items}></Carousel>
    }

    return (
        <>
            {['timeline_entry'].includes(item.type) && itemData}
                {!['timeline', 'timeline_entry'].includes(item.type)
                    && items}
                {!['base', 'timeline_entry'].includes(item.type) && itemData}
            {['base'].includes(item.type) && itemData}
        </>
    );
}

export function parse(s) {
    try{
        return JSON.parse('{' + s + '}' || "{}");
    } catch (e) {
        return {};
    }
}

const Item = ({item, depth=0} : ItemProps) => {
    return (
        <TransformItem key={item.id}
                       style={parse(item.style) || {}}
                       type={item.type}
                       depth={depth}
                       id={item.id}
                       className={'transform-origin ' + item.class_name}>
            <SimpleItem item={item} depth={depth}></SimpleItem>
        </TransformItem>
    );
};

export default Item;