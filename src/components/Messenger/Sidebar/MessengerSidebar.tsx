//@ts-nocheck
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import "./MessengerSidebar.scss";
import {isMobileDevice, triggerEvent} from "helpers/events";
import ToggleButton from "ui/Buttons/ToggleButton/ToggleButton";
import {ReactComponent as IconChevronRight} from "ui/Iconpack/icons/chevron-right.svg";
import Slider from "ui/Slider/Slider";
import SidebarList from "./SidebarList";
import FormInput from "../../Modals/MyForm/Input/FormInput";
import {createRoom, setCurrentRoom, updateRoom, updateUser} from "../api/firebase";
import {getViewportSize} from "../../../ui/helpers/viewport";
import Swipes from "../../../ui/Swipes/Swipes";
import AccordionContainer from "../../../ui/Accordion/AccordionContainer";
import {adminEmail} from "../api/config";
import {SearchContainer} from "../../../ui/Tools/Tools";
import {useAppSelector} from "../../../hooks/redux";


const MessengerSidebar = () => {
    const userAdmin = useAppSelector(state => state.users.current);
    const {rooms, room, users, user} = useAppSelector(state => state.messenger);

    function setRoom(id) {
        if (!user) {
            window.callbacks.call("user-auth", true);
            return;
        }
        if (room.id === id) id = '';
        setCurrentRoom(id);
    }

    const [isOpened, setOpened] = useState(() => (!isMobileDevice() || getViewportSize() < 500));

    const togglers = [
        {
            element: <ToggleButton isOpened={isOpened} width={40}>
                        <IconChevronRight/>
                    </ToggleButton>,
            action: 'toggle',
            callback: () => setOpened(!isOpened),
        }
    ];

    async function getOrCreateRoom(item) {
        let room = null;

        if (!user) {
            window.callbacks.call("user-auth", true);
            return;
        }

        let check = [users[item].email, user.email].sort();
        const equal = (a, b) => a.every((el, i) => el === b[i]);
        for (const r of Object.values(rooms)) {
            if (equal([...r.users].sort(),check)) {
                room = rooms[r.id];
                break;
            }
        }
        if (!room) {
            createRoom([users[item], user]);
        } else {
            setRoom(room.id);
        }
    }

    const [userList, setUserList] = useState({users: [], show: false});
    const [search, setSearch] = useState('');
    useLayoutEffect(()=>{
        searchAll();
    },[users]);
    function searchAll() {
        let newUsers = {};
        Object.values(users).forEach(user => {
            newUsers[user.id] = user;
        })
        setUserList(l => ({...l, users: newUsers}));
    }

    function templateRoom() {
        let companion = 0;
        for (const user in users) {
            if (users[user].email === adminEmail) companion = user;
        }
        if (companion) return {1: {
                    users: [adminEmail, adminEmail],
                    picture: users[companion].picture,
                    title: users[companion].name,
                    lastMessage: {},
                    newMessage: false,
                    notified: true,
                    id: '',
                    companion,
                }};
        return {};
    }
    return (
        <Swipes callback={setOpened} state={isOpened} className={'messenger'}>
            <div className={"scrollable messenger__sidebar-inner " + (isOpened ? 'opened' : 'closed')}>
                <Slider togglers={togglers} callback={(v) => setOpened(v)} defaultOpened={isOpened}>
                    <div className={"sidebar-container"}>
                        <div className={"sidebar__search"}>
                            {userAdmin.isAdmin && <SearchContainer placeholder={'Поиск пользователей'}
                                             data={Object.values(users)}
                                             inputCallback={setSearch}
                                             setData={(users) => setUserList(l => ({users, show: l.show}))}
                                             searchBy={'name'}
                                             onFocus={() => {setUserList(l => ({...l, show: true}))}}>
                            </SearchContainer>}
                            {!Object.keys(userList.users).length && !!search && <p>Пользователи не найдены</p>}
                        </div>
                        {userAdmin.isAdmin && <AccordionContainer defaultOpened={userList.show} callback={() => setUserList(l => ({...l, show: false}))}>
                            <SidebarList className={'sidebar__users'}
                                         list={userList.users}
                                         currentItem={() => false}
                                         text={'name'}
                                         selectCallback={getOrCreateRoom} user={user}>
                            </SidebarList>
                        </AccordionContainer>}
                        <div className={'sidebar__users-delimiter'}></div>
                        <SidebarList className={'sidebar__rooms'}
                                     list={Object.values(rooms).length ? rooms : templateRoom()}
                                     currentItem={(id) => id === room.id}
                                     text={'title'}
                                     subtext={true}
                                     selectCallback={setRoom} user={user}>
                        </SidebarList>
                    </div>
                </Slider>
            </div>
        </Swipes>
    );
};

export default MessengerSidebar;