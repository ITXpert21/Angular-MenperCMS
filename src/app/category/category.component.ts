import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationService } from '../services/pagination.service';

import { AngularFirestore } from 'angularfire2/firestore';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';
import { SingletonClass } from '../globals/menpersingletone';
import { AppHelpers } from '../globals/menperhelpers';

import { AddNewCategoryComponent } from '../dialogs/add-new-category/add-new-category.component';
import { EditCategoryComponent } from '../dialogs/edit-category/edit-category.component';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { EventNotifier } from '../globals/EventNotifier';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categorylist=[];
  category = {
    name: '',
    id:''
  };
  isLoading=false;
  showSpinner: boolean = true;

  private categorySubscription: Subscription;
  private categoryChacheSubscription:Subscription;


  constructor(
    public dialog: MatDialog,
    private router: Router,
    private firestore: AngularFirestore,
    public page: PaginationService
    
  ) { 
    this.subscribeForCategoryEventChanged();
  }

  ngOnInit() {
    this.reloadCategoryFromCache();
  }

  ngOnDestroy() {

    if (this.categorySubscription != undefined){
        console.log("unsubscribed")
        this.categorySubscription.unsubscribe();
    }
    if(this.categoryChacheSubscription!=undefined){
      this.categoryChacheSubscription.unsubscribe()
    }
    
  }


  // async getDataFromCache () {
  //   if (this.categorySubscription != undefined){
  //     this.categorySubscription.unsubscribe();
  //     this.categorySubscription= undefined;
  //   }

  //   var aCollection = this.firestore.collection("caches");
  //   // .snapshotChanges() returns a DocumentChangeAction[], which contains
  //   // a lot of information about "what happened" with each change. If you want to
  //   // get the data and the id use the map operator.
  //   this.categorySubscription = aCollection.snapshotChanges().pipe(
  //     map(actions => actions.map(a => {
  //       // console.log(a.payload.doc);
  //       const data = a.payload.doc.data();
  //       // console.log(data);
  //       const idet = a.payload.doc.id;
  //       var dict = {}; // create an empty array
  //       dict[idet] = data
  //       return {...dict};
  //     }))
  //   ).subscribe(async cachesdict => {
  //     // console.log(cachesdict)
  //     SingletonClass.getInstance().set("cachesdict",cachesdict);
  //     await AppHelpers.handleCacheChange();
  //     this.showSpinner = false;
  //     this.reloadCategoryFromCache();
  //     // console.log('cachedict running'+cachesdict);
  //   });
  // }

  async reloadCategoryFromCache (){

    var aCollection = this.firestore.collection('category');
    this.categorySubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(categorylist => {
      this.categorylist = categorylist;
      this.categorylist.sort((a, b) => (a.name > b.name) ? 1 : -1);
      this.showSpinner = false;
    });
  }

  addNewCategoryClick(): void{
    const dialogRef = this.dialog.open(AddNewCategoryComponent, {
      width: '600px',
    });
  

    
    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed`);
    });
  }
  

  EditCategoryClick(aCategory){
    const dialogRef = this.dialog.open(EditCategoryComponent, {
      width: '600px',
      data: {category: aCategory}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  DeleteCategoryClick(category:any){
    // console.log(category)
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',
      // data: {category: aCategory}
    });
    dialogRef.componentInstance.title = 'CATEGORY DELETE';
    dialogRef.componentInstance.descr = "Please remove the Product(s) that belongs to " +category.name +" first!";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.firestore.collection('category').doc(category.id).delete()
        .then(async () => {
          // user created. now create profile in firestore.
          this.openInformDialog("SUCCESS","Category deleted successfully.");
          var index=this.categorylist.indexOf(category)
          this.categorylist.splice(index,1)
          await AppHelpers.handleCacheChange();
        })
        .catch((error) => {
          console.log("Error", error);
          this.openInformDialog("Error", error.message);
        });
      }
    });
  }
  // DeleteCategoryClick(category){
  //   const dialogRef = this.dialog.open(DeleteDialogComponent, {
  //     width: '600px',
  //   });
  //   dialogRef.componentInstance.title = 'CATEGORY';
  //   dialogRef.componentInstance.descr = "Please remove the Product(s) that belongs to " +category.name +" first!";
  //   dialogRef.componentInstance.deleteTitle = "Delete";
  //   dialogRef.componentInstance.cancelTitle = "Cancel";
  //   dialogRef.afterClosed().subscribe(result => {
  //     let deleteDoc = this.firestore.collection('category').doc(category.id).delete();
  //     if (result == dialogRef.componentInstance.deleteTitle){
  //       this.firestore.collection('category').doc(category.id).delete()
  //       .then(() => {
  //         this.openInformDialog("SUCCESS","Announcement deleted successfully.");
  //       })
  //       .catch((error) => {
  //         console.log("Error", error);
  //         this.openInformDialog("Error", error.message);
  //       });
  //     }
  //   });     
  //   }
  // }

  openInformDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle="OK";
      
  }

  // After any update to notify category refreshed
  private subscribeForCategoryEventChanged(){
    this.categoryChacheSubscription = EventNotifier.getInstance().getSubject().subscribe(message=>{
      // console.log(message)
      if(message=="categoryRefreshed"){
        console.log("Category Cache Refreshed")
        this.reloadCategoryFromCache()
      }
   })
  }

}
