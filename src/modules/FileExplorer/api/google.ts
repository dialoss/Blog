//@ts-nocheck
import Credentials from "../../Authorization/api/googleapi";
import dayjs from "dayjs";
import axios from 'axios'
import {call, mul} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {getCompressedImage} from "../../../components/Item/components/Image/helpers";
import {getFileType} from "../helpers";

enum GoogleDrive {
    BASE_URL = "https://www.googleapis.com/drive/v2/files/",
    UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files/",
    ROOT_FOLDER = '12dZHb2PW4UfLePKrEZnYAikZpoQqSPVb',
}

interface RequestData {
    method: string,
    headers?: object,
    body?: object,
}

export class GoogleRequests {
    async request(url: string, data: RequestData={method: "GET", headers: {}, body:{}}) {
        let body = {};
        // console.log('storage request', data, url);
        if (data.body && Object.values(data.body).length) body = {data: data.body};
        if (!data.headers) data.headers = {};
        return await axios({
            method: data.method,
            url,
            headers: {
                "Authorization": "Bearer " + await Credentials.getToken(),
                ...data.headers,
            },
            ...body,
        }).then(d => {
            // console.log('storage response', d);
            return d;
        });
    }
}

export interface StorageAPI {
    request(url: string, data: RequestData) : Promise<StorageFile[]>;
    list(id: string) : Promise<StorageFile[]>;
    update(file: StorageFile) : Promise<StorageFile[]>;
    get(id: string) : Promise<StorageFile[]>;
    put(file: File, callback: (status: UploadStatus) => void) : void;
    post(unique: boolean, file: StorageFile) : Promise<StorageFile[]>;
    delete(file: StorageFile) : Promise<StorageFile[]>;
}

export interface GoogleFileParent {
    id: string;
}

export interface GoogleFile {
    parents: string[] | ({id: string})[];
    title: string;
    kind: 'drive#file';
    mimeType: 'application/vnd.google-apps.folder' | 'application/vnd.google-apps.file';
    properties?: {[key:string]:string};
}

export class GoogleDriveAPI implements StorageAPI {
    requests = new GoogleRequests();
    async request(url: string, data: RequestData={method: "GET", headers: {}, body:{}}) {
        return (await this.requests.request(url, data).then(d => d.data.items || [d.data])).map(f => serializeObject(f));
    }

    list(id: string) {
        let q = GoogleDrive.BASE_URL + `?q='${id || GoogleDrive.ROOT_FOLDER}'+in+parents and trashed=false`;
        return this.request(q);
    }

    update(file: StorageFile) {
        return this.request(GoogleDrive.BASE_URL + file.id + '/', {method: 'PATCH', body: file});
    }

    get(id: string) {
        return this.request(GoogleDrive.BASE_URL + id);
    }

    async post(unique: boolean, file: StorageFile | EmptyStorageFile) {
        if (unique) {
            let q = GoogleDrive.BASE_URL + `?q='${file.parent || GoogleDrive.ROOT_FOLDER}'+in+parents and trashed=false and mimeType='application/vnd.google-apps.${file.mimeType}'`;
            for (const f of (await this.request(q))) {
                if (f.name === file.name) return [f];
            }
        }
        return await this.request(GoogleDrive.BASE_URL, {
            method: 'POST',
            body: {
                parents: [{
                    id: file.parent || GoogleDrive.ROOT_FOLDER,
                }],
                title: file.name,
                kind: 'drive#file',
                mimeType: 'application/vnd.google-apps.' + file.mimeType,
            }
        });
    }

    copy(file: StorageFile) {
        return this.request(GoogleDrive.BASE_URL + file.id + '/copy', {method: "POST", body: file});
    }

    delete(file: StorageFile) {
        return this.request(GoogleDrive.BASE_URL + file.id, {method: "DELETE"});
    }

    put(file: File, callback: (status: UploadStatus) => void) {
        // console.log(file);
        const id = Math.floor(Math.random() * 100000000);
        const config = {
            onUploadProgress: e => callback({
                    uploadID: id,
                    rate: e.rate,
                    progress: e.progress,
                    filename: file.name,
                    message: 'Загрузка'
            }),
            headers: {
                "Content-Range": `bytes 0-${file.size - 1}\/${file.size}`,
                'X-Upload-Content-Type': file.type,
            },
        };
        return this.requests.request(GoogleDrive.UPLOAD_URL + "?uploadType=resumable", {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: {
                parents: [file.parent || GoogleDrive.ROOT_FOLDER],
                name: file.name,
                mimeType: file.type,
                properties: file.props,
            },
            method: 'POST',
        }).then(r =>
            axios.put(r.headers.get('Location'), file, config).catch(e => console.log(e))
        );
    }
}

export interface UploadStatus {
    uploadID: number;
    progress: number;
    filename: string;
    message: string;
    rate: number;
}

enum FileType {
    VIDEO = 'video',
    IMAGE = 'image',
    MODEL = 'model',
    FOLDER = 'folder',
    FILE = 'file',
}

interface MediaFileProps {
    media_width: number,
    media_height: number,
    thumb: string,
}

interface ModelFileProps {
    urn: string,
}

export interface EmptyStorageFile {
    name: string,
    parent: string,
    mimeType: "file" | "folder",
}

export interface StorageFile {
    id: string,
    name: string,
    type: string,
    mediaType: string,
    size: number,
    hash: string,
    props: MediaFileProps | ModelFileProps | {},
    modifiedTime: string,
    parent: string,
    mimeType: "file" | "folder",
}

export function serializeObject(file: object) : StorageFile {
    if (!file.mimeType) return {};
    let mimeType = file.mimeType.split('.').slice(-1)[0];
    let props = (file.properties || []);
    let fileProps : MediaFileProps | ModelFileProps = {};
    const name = file.title || file.name || '';
    let id = file.id;
    if (mimeType !== 'folder') {
        mimeType = 'file';
    }

    let urn = '';
    let [width, height] = [0, 0];
    for (const prop of props.reverse()) {
        if (prop.key.includes('urn')) urn += prop.value || '';
        if (prop.key === 'width') width = +prop.value;
        if (prop.key === 'height') height = +prop.value;
    }
    let type: string = getFileType(name);
    if (type.match(/image|video/)) {
        fileProps = {
            thumb: getCompressedImage({
                media_width: width,
                media_height: height,
                url: id,
            }, 200),
            media_width: width,
            media_height: height,
        };
    }
    if (type.match(/model/)) {
        fileProps = {
            urn,
        };
    }

    return {
        id,
        parent: '',
        name,
        type: mimeType,
        thumb: fileProps.thumb,
        mimeType,
        mediaType: type,
        size: +file.fileSize || 0,
        hash: id + (new Date().getTime()) as string,
        props: fileProps,
        modifiedTime: dayjs(file.modifiedDate).format("HH:mm DD.MM.YYYY") as string,
    };
}
