//@ts-nocheck
import {getLocation} from "../../../hooks/getLocation";
import {EmptyStorageFile, GoogleDriveAPI, StorageAPI, StorageFile} from "./google";
import {uploadAutodeskFile} from "../../../components/Item/components/Model/Autodesk/api/api";
import {getFileType, MediaDimensions} from "../helpers";


export interface IAppStorage {
    storageAPI: StorageAPI,
    listFiles(id: string) : Promise<StorageFile[]>;
    getFile(id: string) : Promise<StorageFile>;
    copy(id: string, dest: string);
    delete(file : StorageFile);
    uploadFile(file: File, path: string[], callback);
    getSpace(): Promise<StorageSpace>;
}

export class AppStorage implements IAppStorage {
    storageAPI = new GoogleDriveAPI();

    newFile(path: string[], file: EmptyStorageFile) {
        return this.storageAPI.post(false, file);
    }

    async newFolderWithPath(path: string[]) {
        let folderID = '';
        let nextFolder : EmptyStorageFile = {parent:'', name:'', mimeType:'folder'};
        let folderData : StorageFile;
        for (const f of path) {
            nextFolder.parent = folderID;
            nextFolder.name = f;
            folderData = (await this.storageAPI.post(true, nextFolder))[0];
            folderID = folderData.id;
        }
        return folderData;
    }

    listFiles(id: string) {
        return this.storageAPI.list(id);
    }

    delete(file : StorageFile) {
        return this.storageAPI.delete(file);
    }

    async uploadFile(file: File, path: string[], callback) {
        let props = {};
        if (getFileType(file.name).match(/image|video/)) {
            props = await new MediaDimensions(file).get();
        }
        if (getFileType(file.name).match(/model/)) {
            let urn = await uploadAutodeskFile(file, callback);
            props = {
                modelurn1: urn.slice(0, urn.length / 2),
                modelurn2: urn.slice(urn.length / 2),
            }
        }
        file.props = props;
        if (!file.parent) {
            if (!path.length) path = ['site', 'storage', getLocation().pageSlug];
            file.parent = (await this.newFolderWithPath(path)).id;
        }
        return this.storageAPI.put(file, callback).then((d) => console.log(d));
    }

    getSpace(): Promise<StorageSpace> {
        return this.storageAPI.requests.request('https://www.googleapis.com/drive/v2/about').then(d => {
            return ({
                used: +d.data.quotaBytesUsed,
                total: +d.data.quotaBytesTotal,
            })
        });
    }

    getFile(id: string) {
        return this.storageAPI.get(id)[0];
    }
    copy(id: string, dest: string) {
        return this.storageAPI.copy({id, parents: [{id:dest}]});
    }
    update(file: StorageFile) {
        return this.storageAPI.update(file);
    }
    transferFiles(event, callback) {
        return Promise.all(FileTransfer.getFiles(event).map(f => {
            if (f.needUpload === undefined) return this.uploadFile(f, [], callback);
            return f;
        }))
    }
}

interface StorageSpace {
    used: number,
    total: number,
}

declare global {
    interface Window {
        storage: AppStorage;
    }
}

export const storage = new AppStorage();
window.storage = storage;

class FileTransfer {
    static getTransfer(event: any): File[] {
        switch (event.type) {
            case "drop":
                return [...(JSON.parse(event.dataTransfer.getData('files') || "[]")).map(f => ({...f, needUpload: false})),
                    ...event.dataTransfer.files];
            case "change":
                return [...event.target.files];
            case "paste":
                return [...event.clipboardData.files];
            default:
                return [];
        }
    }
    static getFiles(event: any): File[] {
        const files = FileTransfer.getTransfer(event);
        if (files.length) {
            event.stopPropagation();
            event.preventDefault();
        }
        return files;
    }
}
