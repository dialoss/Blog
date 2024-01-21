
//@ts-nocheck
import React, {useContext} from 'react';
import Avatar from "../../../ui/Avatar/Avatar";
import dayjs from "dayjs";
import {useAppSelector} from "hooks/redux";
import {getMessageText} from "../helpers/messages";

const SidebarList = ({list, className, currentItem, text, subtext=false, selectCallback, user}) => {
    const {users} = useAppSelector(state => state.messenger);
    return (
        <div className={"messenger-sidebar__list " + className}>
            {
                Object.values(list).map(item => {
                    const msg = item.lastMessage;
                    let userItem = users[item.companion || item.id];
                    if (!userItem || !userItem.id) return;
                    const lastTime = userItem.lastSeen;
                    const online = userItem.online;
                    return <div className={"sidebar-item__wrapper " + (currentItem(item.id) ? "current " : '') +
                        (item.newMessage && item.lastMessage.user !== user.id ? "new" : '')}
                                onClick={() => selectCallback(item.id)}
                                key={userItem.id}>
                        <div className={"sidebar-item " + (online ? 'online' : 'offline')}>
                            <Avatar src={item.picture} user={userItem}></Avatar>
                            <span className="text-wrapper">
                            <span className={"text"}>
                                <span className={'wrapper'}>{item[text]}
                                </span>
                            </span>
                                {!subtext && <span className={"subtext subtext-lastseen"}>
                                        <span className={'wrapper'}>
                                            <span>{!online ? 'Был в сети ' +
                                                (lastTime?dayjs(lastTime).format("HH:mm DD.MM"):'') : 'Онлайн'}</span>
                                        </span>
                                </span>}
                                {subtext && msg && <span className={"text-block"}>
                                <span className={"subtext subtext-message"}>
                                    <span className={'wrapper'}>{getMessageText(msg)}</span>
                                </span>

                                <span className={"subtext subtext-date"}>
                                    <span className={'wrapper'}>
                                        {msg.user && dayjs(msg.timeSent).format("HH:mm")}
                                    </span>
                                </span>
                            </span>}
                        </span>
                        </div>
                    </div>
                })
            }
        </div>
    );
};

export default SidebarList;