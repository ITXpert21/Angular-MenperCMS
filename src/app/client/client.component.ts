import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationService } from '../services/pagination.service';
import { SingletonClass } from '../globals/menpersingletone';
import { AppHelpers } from '../globals/menperhelpers';

import { AngularFirestore } from 'angularfire2/firestore';
import { SuccessOkDialogComponent }
  from '../dialogs/success-ok-dialog/success-ok-dialog.component';

import { AddNewClientComponent } from '../dialogs/add-new-client/add-new-client.component';
import { EditClientsComponent } from '../dialogs/edit-clients/edit-clients.component';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { EventNotifier } from '../globals/EventNotifier';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  selectedSalesPersonId = '';
  clientlist = [];
  salesPersonList = [];
  salesPersonIdMap = {};
  client: {
    name: '',
    address: '',
    email: '',
    phone: ''
  }
  searchTxt = "";
  clientlistBySearch = [];

  isLoading = false;

  private clientSubscription: Subscription;
  private salesSubscription: Subscription;

  private clientChacheSubscription: Subscription;

  checked = true;
  showSpinner: boolean = true;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private firestore: AngularFirestore,
    public page: PaginationService
  ) {
    this.subscribeForClientEventChanged();
  }

  ngOnInit() {
    this.updateSalepersonList();
    this.reloadClientsFromCache();
  }
  ngOnDestroy() {

    if (this.clientSubscription != undefined) {
      this.clientSubscription.unsubscribe();
    }
    if (this.salesSubscription != undefined) {
      this.salesSubscription.unsubscribe();
    }
    if (this.clientChacheSubscription != undefined) {
      this.clientChacheSubscription.unsubscribe()
    }

  }
  onKeypressEvent(event: any){
    this.searchTxt = event.target.value;
    this.clientlistBySearch = [];
    // this.p = 1;
    var clienttName = "";
    var salePersonId = "";
    if(this.selectedSalesPersonId == "" && this.searchTxt == ""){
      this.clientlistBySearch = this.clientlist;
      for(var i=0; i<this.clientlistBySearch.length; i++){
        this.clientlistBySearch[i].number = i + 1;
      }
      return;
    } 
    for(var i=0; i<this.clientlist.length; i++){

      // if((this.clientlist[i].name == undefined)){
      //   clienttName = ""
      // }
      // if((this.clientlist[i].salesperson == undefined)){
      //   salePersonId = ""
      // }else{
        clienttName = this.clientlist[i].name.toLowerCase();
        if((this.clientlist[i].salesperson == undefined))
          salePersonId = "";
        else  
          salePersonId = this.clientlist[i].salesperson.id;

        if(this.selectedSalesPersonId != "" && this.searchTxt != ""){
          if(clienttName.includes(this.searchTxt.toLowerCase()) && salePersonId.includes(this.selectedSalesPersonId))
            this.clientlistBySearch.push(this.clientlist[i]);
        }
        if(this.selectedSalesPersonId == "" && this.searchTxt != ""){
          if(clienttName.includes(this.searchTxt.toLowerCase()))
            this.clientlistBySearch.push(this.clientlist[i]);
        }        
        if(this.selectedSalesPersonId != "" && this.searchTxt == ""){
          if(salePersonId.includes(this.selectedSalesPersonId))
            this.clientlistBySearch.push(this.clientlist[i]);
        } 
      //}      

    }

    for(var i=0; i<this.clientlistBySearch.length; i++){
      this.clientlistBySearch[i].number = i + 1;
    }
  }

  selectCategory(val){
    this.selectedSalesPersonId = val;
    this.clientlistBySearch = [];
    // this.p = 1;
    var clienttName = "";
    var salePersonId = "";
    if(this.selectedSalesPersonId == "" && this.searchTxt == ""){
      this.clientlistBySearch = this.clientlist;
      for(var i=0; i<this.clientlistBySearch.length; i++){
        this.clientlistBySearch[i].number = i + 1;
      }
      return;
    } 

    for(var i=0; i<this.clientlist.length; i++){
      if((this.clientlist[i].name == undefined)){
        clienttName = ""
      }
      // if((this.clientlist[i].salesperson == undefined)){
      //   salePersonId = ""
      // }else{
        clienttName = this.clientlist[i].name.toLowerCase();
        if((this.clientlist[i].salesperson == undefined))
          salePersonId = "";
        else  
          salePersonId = this.clientlist[i].salesperson.id;

        if(this.selectedSalesPersonId != "" && this.searchTxt != ""){
          if(clienttName.includes(this.searchTxt.toLowerCase()) && salePersonId.includes(this.selectedSalesPersonId))
            this.clientlistBySearch.push(this.clientlist[i]);
        }
        if(this.selectedSalesPersonId == "" && this.searchTxt != ""){
          if(clienttName.includes(this.searchTxt.toLowerCase()))
            this.clientlistBySearch.push(this.clientlist[i]);
        }        
        if(this.selectedSalesPersonId != "" && this.searchTxt == ""){
          if(salePersonId.includes(this.selectedSalesPersonId))
            this.clientlistBySearch.push(this.clientlist[i]);
        } 
      //}    
    }
    for(var i=0; i<this.clientlistBySearch.length; i++){
      this.clientlistBySearch[i].number = i + 1;
    }
  }


  // get salepersonlist form user
  updateSalepersonList() {
    var aCollection = this.firestore.collection('user', ref =>
      //ref.where('role_id','==','2')
      ref.where('is_active','==','Y'));
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
    this.salesSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(alist => {
      this.salesPersonList = alist;
      var dict = {};
      for (let aPer of this.salesPersonList) {
        dict[aPer.id] = aPer;
      }
      this.salesPersonIdMap = dict;
      // this.reloadClientsFromCache();
    });

  }

  //get clientslist form clientsdict
  async reloadClientsFromCache() {

    var aCollection = this.firestore.collection('client');
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
    this.salesSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(alist => {
      this.clientlist = alist;
      this.clientlistBySearch = this.clientlist;
      for(var i=0; i<this.clientlistBySearch.length; i++){
        this.clientlistBySearch[i].number = i + 1;
      }
          //associating salesPerson 
      for (var i = 0; i < this.clientlist.length; i++) {
        var perId = this.clientlist[i].user_id;
        if ((perId != undefined) && (this.salesPersonIdMap[perId] != undefined)) {
          this.clientlist[i].salesperson = this.salesPersonIdMap[perId];
        } else {
          this.clientlist[i].salesperson = undefined;
        }
      }
      this.showSpinner = false;
    });

  }

  // onChange(event) {
  //   console.log('onChange event.checked '+event.checked);
  //   window.alert("The Client Status has been changed");
  // }

  activeClientClick(client: any): void {
    window.alert("The Client Status has been changed");
    this.firestore.collection('client').doc(client.id).set({
      is_active: 'Y',
    }, { merge: true })
      .then(() => {
        // this.openInformDialog("SUCCESS","client activated successfully.");
      })
      .catch((err) => {
        console.log("Error", err);
        this.openInformDialog("Error", err.message);
      });
  }

  inactiveClientClick(client: any): void {
    window.alert("The Client Status has been changed");
    this.firestore.collection('client').doc(client.id).set({
      is_active: 'N',
    }, { merge: true })
      .then(() => {
        // this.openInformDialog("SUCCESS","client inactivated successfully.");
      })
      .catch((err) => {
        console.log("Error", err);
        this.openInformDialog("Error", err.message);
      });
  }

  addNewClientClick(): void {
    const dialogRef = this.dialog.open(AddNewClientComponent, {
      width: '600px',
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed: ${result}`);
    });
  }

  EditClientClick(aClient) {
    const dialogRef = this.dialog.open(EditClientsComponent, {
      width: '600px',
      data: { client: aClient }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  DeleteClientClick(client: any) {
    // if(client.id == undefined){
    //   return
    // }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',

    });
    dialogRef.componentInstance.title = 'DELETE CLIENT';
    dialogRef.componentInstance.descr = "Are you sure you want to delete " + client.name + "?";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.firestore.collection('client').doc(client.id).delete()
          .then(async () => {
            // user created. now create profile in firestore.
            this.openInformDialog("SUCCESS", "Client deleted successfully.");
            var index = this.clientlist.indexOf(client)
            this.clientlist.splice(index, 1)
            await AppHelpers.handleCacheChange();
          })
          .catch((error) => {
            console.log("Error", error);
            this.openInformDialog("Error", error.message);
          });
      }
    });
  }

  openInformDialog(title = '', msg = ''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle = "OK";

  }

  // After any update to notify category refreshed
  private subscribeForClientEventChanged() {
    this.clientChacheSubscription = EventNotifier.getInstance().getSubject().subscribe(message => {
      // console.log(message)
      if (message == "clientRefreshed") {
        console.log("Client Cache Refreshed")
        this.reloadClientsFromCache()
      }
    })
  }

}
