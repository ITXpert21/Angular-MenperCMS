export class Upload {

    $key: string;
    file:File;
    name:string;
    url:string;
    progress:number;
    totalBytes:number;
    uniqId:string;
    createdAt: Date = new Date();
    
    constructor(file:File) {
        this.file = file;
    }
}