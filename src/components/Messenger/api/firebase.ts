//@ts-nocheck
import { ref as storageRef, uploadBytes } from "firebase/storage";
import {
    doc,
    addDoc,
    updateDoc,
    onSnapshot,
    arrayUnion,
    collection, setDoc
} from "firebase/firestore";
import {ref, set, onValue, update} from "firebase/database";
import {useLayoutEffect, useRef, useState} from "react";
import {realtime, firestore, storage, MDB, adminEmail} from "./config";
import {useAppSelector} from "hooks/redux";
import store from "store";
import {getGlobalTime, sendLocalRequest} from "../../../api/requests";
import {actions, IRoom, IUser} from "../store/reducers";
import {triggerEvent} from "../../../helpers/events";
import {getLocation} from "../../../hooks/getLocation";

const uniqueID = async () => +Date.parse((await getGlobalTime()).utc_datetime);

export class MessageManager {
    db = null;
    storage = null;
    actions = null;
    appName = null;
    config = {};

    constructor(appName, actions, config) {
        this.db = collection(firestore, 'apps', appName, 'data');
        this.storage = appName;
        this.actions = actions;
        this.appName = appName;
        this.config = config;
    }

    async sendMessage(data) {
        let sendData = {
            id: await uniqueID(),
            timeSent: (await getGlobalTime()).utc_datetime,
            user: data.user_id,
            value: data.message,
            ...data.extraFields,
        };
        await updateDoc(doc(this.db, this.config.getDocument()), {messages: arrayUnion(sendData)});
        return sendData;
    }

    uploadMedia(upload, callback) {
        return new Promise((resolve) => {
            let path = [this.appName];
            if (path[0] === 'comments') path.push(getLocation().pageSlug);
            (async function () {
                const file = await window.storage.uploadFile(upload, path, callback);
                resolve(file);
            })();
        });
    }
}

export function updateUser(type, data) {
    const user: IUser = store.getState().messenger.user;
    if (type === 'firestore') {
        const newUser = {[user.id]: {...user, ...data}};
        delete newUser[user.id].isTyping;
        delete newUser[user.id].online;
        delete newUser[user.id].lastSeen;
        delete newUser[user.id].currentRoom;
        customUpdate('users', '', newUser);
    } else {
        update(ref(realtime, 'users/' + user.id), data);
    }
}

export function changeRoomData(room, user, users) {
    if (!room.picture || !room.title) {
        let email = Object.values(room.users).filter(e => e !== user.email)[0];
        let companion = Object.values(users).find(e => e.email === email);
        if (!email) companion = user;
        if (!companion) return room;
        return {...room, picture: companion.picture, title: companion.name, companion: companion.id};
    } else {
        return room;
    }
}

export async function createRoom(usersInRoom: IUser[]) {
    const messagesID = JSON.stringify(usersInRoom.map(u => u.email).sort());
    const room: IRoom = {
        users: usersInRoom.map(u => u.email),
        picture: '',
        title: '',
        messages: messagesID,
        id: await uniqueID(),
    };
    const messagesDoc = {
        messages: [],
    }
    setDoc(doc(MDB, messagesID), messagesDoc).then(m => {
        updateDoc(doc(MDB, 'rooms'), {rooms: arrayUnion(room)}).then(d => {

            if (usersInRoom[0].id === usersInRoom[1].id) usersInRoom = [usersInRoom[0]];
            let updatedUsers = {};

            usersInRoom.forEach(user => {
                updatedUsers[user.id] = {...user, rooms: [...user.rooms, room.id]};
            });

            customUpdate('users', '', updatedUsers).then(()=> setCurrentRoom(room.id));
        });
    });
}

export function customUpdate(name, raw, newData) {
    const state = store.getState().messenger;
    if (raw) raw = '_' + raw;
    const data_raw = state[name + raw];
    return updateDoc(doc(MDB, name), {[name]: Object.values({...data_raw, ...newData})});
}

export function useGetUsers() {
    useLayoutEffect(() => {
        onSnapshot(doc(MDB, 'users'), q => {
            let newUsers = {};
            q.data().users.forEach(user => {
                newUsers[user.id] = user;
            });
            store.dispatch(actions.setField({field:'users', data: newUsers}));
            // console.log('snapshot users', newUsers);
        });

        const usersMeta = ref(realtime, 'users');
        onValue(usersMeta, (snapshot) => {
            const data = snapshot.val();
            store.dispatch(actions.setUsersMeta({data}));
        });
    }, []);

}

// user -> rooms -> room -> messages

export function useGetRooms() {
    const {rooms_raw, user, users, room, rooms} = useAppSelector(state => state.messenger);
    useLayoutEffect(() => {
        onSnapshot(doc(MDB, 'rooms'), q => {
            let newRooms = {};
            q.data().rooms.forEach(r => newRooms[r.id] = r);
            store.dispatch(actions.setField({field:'rooms_raw', data:newRooms}));
            // console.log(newRooms)
            // console.log('SNAPSHOT ROOMS')
        });
    }, []);

    useLayoutEffect(() => {
        if (!user) return;
        let newRooms = [];
        Object.values(rooms_raw).map(r => {
            if (r.users.includes(user.email)) {
                newRooms.push(r);
            }
        });
        let objRooms = {};
        newRooms.forEach(r => {
            objRooms[r.id] =  changeRoomData(r, user, users);
        });
        store.dispatch(actions.setField({field:'rooms', data:objRooms}));
    }, [user, rooms_raw, Object.values(users).length]);

    const [meta, setMeta] = useState({});

    useLayoutEffect(() => {
        const roomsMeta = ref(realtime, 'rooms');
        onValue(roomsMeta, (snapshot) => {
            setMeta(snapshot.val());
        });
    }, []);

    useLayoutEffect(() => {
        if (!Object.values(rooms).length) return;
        let newRooms = structuredClone(rooms);
        for (const d in newRooms) {
            newRooms[d] = {...newRooms[d], ...meta[d]};
        }
        let haveNewMessage = false;
        console.log(newRooms)
        for (const r in newRooms) {
            const curRoom = newRooms[r];
            if (curRoom.newMessage &&
                curRoom.lastMessage.user !== user.id &&
                curRoom.id !== room.id
            ) {
                triggerEvent("messenger:notification", true);
                haveNewMessage = true;
            }
            if (!(curRoom.newMessage && curRoom.lastMessage.user !== user.id) || curRoom.notified) continue;
            updateRoom({notified: true}, curRoom.id);
        }
        !haveNewMessage && triggerEvent("messenger:notification", false);
        room.id && newRooms[room.id] && newRooms[room.id].newMessage &&
        newRooms[room.id].lastMessage.user !== user.id && updateRoom({newMessage: false});
        console.log(user.currentRoom)
        console.log(user)
        let roomWithAdmin = null;
        // if (r.users.includes(adminEmail)) roomWithAdmin = r;
        //
        // if (!roomWithAdmin) {
        //     let u = [user, Object.values(users).filter(u => u.email === adminEmail)[0]];
        //     if (u.length > 1) {
        //         createRoom(u);
        //     }
        // }
        // !room.id && setCurrentRoom(roomWithAdmin.id);

        store.dispatch(actions.setField({field:'rooms', data:newRooms}));
        if (window.messenger) {
            window.modals.open("messenger");
            setCurrentRoom(window.messenger);
            window.messenger = null;
        }

    }, [meta, Object.values(rooms).length]);
}

export function updateRoom(data, room_id=null) {
    let {room} = store.getState().messenger;
    if (!room.id && !room_id) return;
    update(ref(realtime, 'rooms/' + (room.id || room_id)), data);
}

export function setCurrentRoom(id) {
    if (!id) store.dispatch(actions.setRoom(-1));
    else store.dispatch(actions.setRoom(id));
    const {rooms, user} = store.getState().messenger;
    updateUser('realtime', {currentRoom: id});
    if (id && rooms[id].newMessage && rooms[id].lastMessage.user !== user.id) {
        updateRoom({newMessage: false})
    }
}