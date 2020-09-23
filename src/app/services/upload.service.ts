import { Injectable } from '@angular/core';
import {AngularFireList} from '@angular/fire/database';
import {Upload} from '../models/upload.model';
import 'firebase/storage';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor() { }
  uploads: AngularFireList<Upload[]>;

  pushUpload(upload: Upload, folder: string) {

    const timestamp = (new Date()).getTime();
    const fileParts = upload.file.name.split('/')
    const lastPart = fileParts[fileParts.length -1];
    const nameParts = lastPart.split('.')
    const fileExtension = nameParts[nameParts.length -1] 
    const someRandom = Math.floor(Math.random() * 10000) + 1 
    const uniqFileName = "prof-"+timestamp+"-"+someRandom+"."+fileExtension;
    upload.uniqId = uniqFileName;
    console.log(uniqFileName);

    let storageRef = firebase.storage().ref(`${folder}`);
    let uploadTask = storageRef.child(`${upload.uniqId}`).put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    (snapshot: firebase.storage.UploadTaskSnapshot) =>  {
        // upload in progress
        upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        upload.totalBytes = snapshot.totalBytes
        console.log('Uploaded: '+upload.progress+' / '+upload.totalBytes);

    },
    (error) => {
        // upload failed
        console.log(error)
    },
    () => {
        // upload success
        uploadTask.snapshot.ref.getDownloadURL()
        .then((aUrl) => {
            console.log(aUrl);
            upload.url = aUrl
            upload.progress=100;
            upload.name = upload.file.name
            this.saveFileData(upload, folder)
        })
    }
    );
}
    // Writes the file details to the realtime db
    private saveFileData(upload: Upload, folder: string) {
      //this.db.list(`${folder}/`).push(upload);
      console.log(upload);
  }

  deleteUpload(upload: Upload, folder:string) {
      // this.deleteFileData(upload.$key)
      // .then( () => {
      this.deleteFileStorage(upload.uniqId, folder)
      // })
      // .catch(error => console.log(error))
  }

  // Deletes the file details from the realtime db
  private deleteFileData(key: string) {
      //return this.db.list(`${this.basePath}/`).remove(key);
  }

  // Firebase files must have unique names in their respective storage dir
  // So the name serves as a unique key
  private deleteFileStorage(uniqId:string, folder:string) {
      let storageRef = firebase.storage().ref(`${folder}`);
      storageRef.child(`${uniqId}`).delete();
  }

}
