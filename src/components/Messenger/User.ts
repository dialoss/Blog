import {IRoom} from "./store/reducers";

interface IUser {
    id: number;
    email: string;
    name: string;
    notification_token: string;
    picture: string;
    rooms: IRoom[];
}

export class User {

}