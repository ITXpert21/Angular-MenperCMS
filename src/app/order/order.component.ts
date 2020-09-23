import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessOkDialogComponent } 
from '../dialogs/success-ok-dialog/success-ok-dialog.component';
import { PaginationService } from '../services/pagination.service';
import { SingletonClass } from '../globals/menpersingletone';
import { AppHelpers } from '../globals/menperhelpers';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection , Query, QueryFn} from 'angularfire2/firestore';

import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { ApproveRejectDialogComponent } from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { DetailOrderComponent } from '../dialogs/detail-order/detail-order.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  orderlist=[];
  orderlistBySearch=[];

  clientlist=[];
  salesPersonList=[];
  selectedDate = '';
  clientIdMap={};
  salesPersonIdMap={};
  searchStartDate : any = "";
  searchEndDate : any = "";
  searchClientName : any = "";
  p: number = 1;
  totalItems = 0;

  order: {
    order_time: '',
    id:'',
  }
  approveTitle:string = '';
  isLoading=false;
  showSpinner: boolean = true;
  selecetedCustomSearch: boolean = false;
  private orderSubscription: Subscription;
  private clientSubscription: Subscription;
  private salesSubscription: Subscription;
  private loadingSubscription:Subscription;


  constructor(
    public dialog: MatDialog,
    private router: Router,
    public authService: AuthService,
    private firestore: AngularFirestore,
    public page: PaginationService

  ) { }

  ngOnInit() {
    this.updateSalepersonList();
  }


  ngOnDestroy() {

    if (this.orderSubscription != undefined){
      this.orderSubscription.unsubscribe();
    }
    if (this.clientSubscription != undefined){
      this.clientSubscription.unsubscribe();
    }
    if (this.salesSubscription != undefined){
      this.salesSubscription.unsubscribe();
    }
    
  }

   updateSalepersonList(){
    var aCollection = this.firestore.collection('user');
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
        // console.log("printing salesperson list" + this.salesPersonList);
        var dict = {};
        for(let aPer of this.salesPersonList){
           dict[aPer.id]=aPer;
        }
        this.salesPersonIdMap = dict;
        this.fetchOrderlistFromOrder();

    });
     
   }
   onSearchByClient(event){
    this.p = 1;
    this.searchClientName = event.target.value;
    this.fetchOrderlistFromOrder();
   }
   selectFromDate(fromDate){  
    this.p = 1;

    this.searchStartDate = new Date(fromDate.year + "-" + fromDate.month + "-" +  fromDate.day);
    if(this.searchStartDate != "Invalid Date")
     this.fetchOrderlistFromOrder();
  }
  selectEndDate(endDate){  
    this.p = 1;

    this.searchEndDate = new Date(endDate.year + "-" + endDate.month + "-" +  endDate.day);
    if(this.searchEndDate != "Invalid Date")
     this.fetchOrderlistFromOrder();
  }

  calcOffsetDate(offsetDays, currentDate){
    var last = new Date(currentDate.getTime() - (offsetDays * 24 * 60 * 60 * 1000));
    var day =last.getDate();
    var month=last.getMonth()+1;
    var year=last.getFullYear();
    return new Date(year + "-" + month + "-" + day);
   }

   selectSearchMethod(val){
    this.p = 1;

    switch(val){
      case "1":
        this.searchStartDate = this.calcOffsetDate(7, new Date('2019-11-30'));
        this.searchEndDate = new Date('2019-11-30');
        this.selecetedCustomSearch = false;
        this.fetchOrderlistFromOrder();
        break;
      case "2":
        this.searchStartDate = this.calcOffsetDate(30, new Date('2019-11-30'));
        this.searchEndDate = new Date('2019-11-30');
        this.selecetedCustomSearch = false;
        this.fetchOrderlistFromOrder();
        break;        
      case "3":
        this.selecetedCustomSearch = true;
        break;           
      case "":
        this.searchEndDate = "";
        this.searchStartDate = "";
        this.selecetedCustomSearch = false;
        this.fetchOrderlistFromOrder();
        break;        
    }
   }

   fetchOrderlistFromOrder(){
      if (this.orderSubscription != undefined){
        this.orderSubscription.unsubscribe();
        this.orderSubscription= undefined;
      }
      var aCollection = this.firestore.collection('order' , (ref) => {
        let query : Query = ref;
        if(this.searchStartDate != "")
          query = query.where('order_time','>', this.searchStartDate) ;
        if(this.searchEndDate != "")  
          query = query.where('order_time','<', this.searchEndDate); 
        return query; 
      });
      this.orderSubscription = aCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      ).subscribe(alist => {
        this.orderlistBySearch = [];
         this.orderlist = alist;
         if(this.searchClientName != ""){
          for(var i=0; i<this.orderlist.length; i++){
            if(this.orderlist[i].client_name.toLowerCase().includes(this.searchClientName.toLowerCase()))
              this.orderlistBySearch.push(this.orderlist[i]);
          }
         }else
          this.orderlistBySearch = this.orderlist;

        for(var i=0; i<this.orderlistBySearch.length; i++){
          this.orderlistBySearch[i].number = i + 1;
        }  
        this.showSpinner = false;
        this.mapSalesPersontoMap()
      });
    }

    //associating salesPerson
    mapSalesPersontoMap(){
      for(var i=0; i<this.orderlist.length; i++){
        var perId = this.orderlist[i].user_id;
        if((perId != undefined) && (this.salesPersonIdMap[perId]!= undefined)){
          this.orderlist[i].salesperson = this.salesPersonIdMap[perId];
        } else {
          this.orderlist[i].salesperson = undefined;
        }
      }
    }

  DeleteOrderClick(order:any){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',

    });
    dialogRef.componentInstance.title = 'DELETE ORDER';
    dialogRef.componentInstance.descr = "Are you sure you want to delete this item";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.firestore.collection('order').doc(order.id).delete()
        .then(() => {
          // user created. now create profile in firestore.
          this.openInformDialog("SUCCESS","Order deleted successfully.");
          var index=this.orderlist.indexOf(order)
          this.orderlist.splice(index,1)

        })
        .catch((error) => {
          console.log("Error", error);
          this.openInformDialog("Error", error.message);
        });
      }
    });
  }

  openInformDialog(title='', msg=''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle="OK";
      
  }

  orderAcceptClick(order:any): void {
    var dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = 'Are you sure?';
    dialogRef.componentInstance.descr = 
    "Do you really want to accept this order?";

    dialogRef.componentInstance.approveTitle = 'Yes, Accept';
    dialogRef.componentInstance.rejectTitle = 'No, Cancel';
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.approveTitle) {
        this.firestore.collection('order').doc(order.id).set({
          accepted: 'Y',
        }, {merge: true})
        .then(() => {
          this.openInformDialog("SUCCESS","Order accepted successfully.");
        })
        .catch((err) => {
          console.log("Error", err);
          this.openInformDialog("Error",err.message);
        });
      }
    });

  }

  orderCancelClick(order:any): void {
    var dialogRef = this.dialog.open(ApproveRejectDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = 'Are you sure?';
    dialogRef.componentInstance.descr = 
    "Do you really want to reject this order?";

    dialogRef.componentInstance.approveTitle = 'Yes, Reject';
    dialogRef.componentInstance.rejectTitle = 'No, Cancel';
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.approveTitle) {
        this.firestore.collection('order').doc(order.id).set({
          accepted: 'N',
        }, {merge: true})
        .then(() => {
          this.openInformDialog("SUCCESS","Order rejected successfully.");
        })
        .catch((err) => {
          console.log("Error", err);
          this.openInformDialog("Error",err.message);
        });
      }
    });

  }
  pageChanged(event){
    // this.productlistByPage = [];
     this.p = event;
  }
  DetailOrderClick(aOrder){
    const dialogRef = this.dialog.open(DetailOrderComponent, {
      width: '21cm',
      height: '29.7cm',
      data: {order: aOrder}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }  
}
