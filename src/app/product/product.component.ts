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

import { AddNewProductComponent } from '../dialogs/add-new-product/add-new-product.component';
import { EditProductComponent } from '../dialogs/edit-product/edit-product.component';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { EventNotifier } from '../globals/EventNotifier';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  pi: number = 4.05;
  selectedCategory = '';
  productlist=[];
  productlistByPage=[];
  productlistBySearch=[];
  isSelectedCategory = false;
  totalItems = 0;
  categorylist=[];
  categoryIdMap={};
  searchTxt = "";
  // product = {
  //   code:'',
  //   name:'',
  //   quantity:'',
  //   price:'',
  //   size:''
  // };

  product=[];
  filterCategoryItem = "";
  p: number = 1;
  showSpinner: boolean = true;
  private productSubscription: Subscription;
  private categorySubscription: Subscription;

  private productChacheSubscription:Subscription

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private firestore: AngularFirestore,
    public page: PaginationService,
    
  ) {
      this.subscribeForProductEventChanged();

   }

  ngOnInit() {
    this.updateCategoryList();
    this.reloadProductsFromCache();
  }

  ngOnDestroy() {

    if (this.productSubscription != undefined){
      this.productSubscription.unsubscribe();
    }

    if (this.categorySubscription != undefined){
      this.categorySubscription.unsubscribe();
    }
    if(this.productChacheSubscription!=undefined){
      this.productChacheSubscription.unsubscribe()
    }
    
  }

  filterCategorySelected(selectedCat) {
    console.log('filterCategorySelected='+selectedCat);
    if (selectedCat == 'none') {
      this.filterCategoryItem = "";
    } else {
      this.filterCategoryItem = selectedCat;
    }
    return true;
  }
  onKeypressEvent(event: any){
    this.searchTxt = event.target.value;
    this.productlistBySearch = [];
    this.p = 1;
    var productName = "";
    var category_id = "";

    if(this.selectedCategory == "" && this.searchTxt == ""){
      this.productlistBySearch = this.productlist;
      for(var i=0; i<this.productlistBySearch.length; i++){
        this.productlistBySearch[i].number = i + 1;
      }
      return;
    } 

    for(var i=0; i<this.productlist.length; i++){
      if(this.productlist[i].category_id != undefined){
        productName = this.productlist[i].name.toLowerCase();
        category_id = this.productlist[i].category_id;

        if(this.selectedCategory != "" && this.searchTxt != ""){
          if(productName.includes(this.searchTxt.toLowerCase()) && category_id == this.selectedCategory)
            this.productlistBySearch.push(this.productlist[i]);
        }
        if(this.selectedCategory == "" && this.searchTxt != ""){
          if(productName.includes(this.searchTxt.toLowerCase()))
            this.productlistBySearch.push(this.productlist[i]);
        }        
        if(this.selectedCategory != "" && this.searchTxt == ""){
          if(category_id == this.selectedCategory)
            this.productlistBySearch.push(this.productlist[i]);
        } 
      }
    }

    for(var i=0; i<this.productlistBySearch.length; i++){
      this.productlistBySearch[i].number = i + 1;
    }
  }

  selectCategory(val){
    this.selectedCategory = val;
    this.productlistBySearch = [];
    this.isSelectedCategory = true;
    this.p = 1;
    var productName = "";
    var category_id = "";

    if(this.selectedCategory == "" && this.searchTxt == ""){
      this.productlistBySearch = this.productlist;
      for(var i=0; i<this.productlistBySearch.length; i++){
        this.productlistBySearch[i].number = i + 1;
      }
      return;
    } 
    for(var i=0; i<this.productlist.length; i++){

      if((this.productlist[i].category_id != undefined)){
        productName = this.productlist[i].name.toLowerCase();
        category_id = this.productlist[i].category_id;

        if(this.selectedCategory != "" && this.searchTxt != ""){
          if(productName.includes(this.searchTxt.toLowerCase()) && category_id == this.selectedCategory)
            this.productlistBySearch.push(this.productlist[i]);
        }
        if(this.selectedCategory == "" && this.searchTxt != ""){
          if(productName.includes(this.searchTxt.toLowerCase()))
            this.productlistBySearch.push(this.productlist[i]);
        }    
        if(this.selectedCategory != "" && this.searchTxt == ""){
          if(category_id == this.selectedCategory){
            
            this.productlistBySearch.push(this.productlist[i]);
          }

            
        } 
      }    
    }
    for(var i=0; i<this.productlistBySearch.length; i++){
      this.productlistBySearch[i].number = i + 1;
    }
  }

  // get categorylist form categoriesdict
  async updateCategoryList () {
    var aCollection = this.firestore.collection('category');
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
    this.categorySubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(categorylist => {
      this.categorylist = categorylist;
      this.categorylist.sort((a, b) => (a.name > b.name) ? 1 : -1);
      var dict = {};
      for (let aPer of this.categorylist) {
        dict[aPer.id] = aPer;
      }
      this.categoryIdMap = dict;
    });

  }

  //get productlist form productsdict
  async reloadProductsFromCache (){

    var aCollection = this.firestore.collection('product');
    // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // a lot of information about "what happened" with each change. If you want to
    // get the data and the id use the map operator.
    this.productSubscription = aCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe(productlist => {
      this.productlist = productlist;
      this.showSpinner = false;
      this.productlistBySearch = productlist;
      for(var i=0; i<this.productlistBySearch.length; i++){
        this.productlistBySearch[i].number = i + 1;
        var perId = this.productlistBySearch[i].category_id;
        if ((perId != undefined) && (this.categoryIdMap[perId] != undefined)) {
          this.productlistBySearch[i].category = this.categoryIdMap[perId];
        } else {
          this.productlistBySearch[i].category = undefined;
        }        
      }
      this.productlistBySearch.sort((a, b) => (a.name > b.name) ? 1 : -1);
    });    

  }
  
  addNewProductClick(): void{
    const dialogRef = this.dialog.open(AddNewProductComponent, {
      width: '600px',
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed: ${result}`);
    });
  }

  EditProductClick(aProduct){
    const dialogRef = this.dialog.open(EditProductComponent, {
      width: '600px',
      data: {product: aProduct}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

   DeleteProductClick(product:any){
    // console.log(product)
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '600px',

    });
    dialogRef.componentInstance.title = 'DELETE PRODUCT';
    dialogRef.componentInstance.descr = "Please remove the Product(s) that belongs to " +product.name +"?";
    dialogRef.componentInstance.deleteTitle = "Delete";
    dialogRef.componentInstance.cancelTitle = "Cancel";
    dialogRef.afterClosed().subscribe(result => {
      if (result == dialogRef.componentInstance.deleteTitle) {
        this.firestore.collection('product').doc(product.id).delete()
        .then(async () => {
          // user created. now create profile in firestore.
          this.openInformDialog("SUCCESS","Product deleted successfully.");
          var index=this.productlist.indexOf(product)
          this.productlist.splice(index,1)
          await AppHelpers.handleCacheChange();
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

  // getProductImage = (aProduct) => {
  //   if (aProduct != undefined){
  //     if((aProduct.productPicture != undefined) && (aProduct.productPicture.url != undefined) 
  //     && (aProduct.productPicture.length > 0)) {
  //       return aProduct.productPicture.url
  //     }else if((aProduct.picture != undefined) && (aProduct.picture.length > 0)){
  //       if (aProduct.picture.startsWith('http') == false) {
  //         return 'https://www.menpercatalog.com/pictures/products/'+aProduct.picture;
  //       }
  //       else {
  //         return aProduct.picture;
  //       }  
  //     }
  //   }
  //   return '';
  // }
  getProductImage = (aProduct) => {
    if (aProduct != undefined){
      if((aProduct.productPicture != undefined) && (aProduct.productPicture.url != undefined)) {
        return aProduct.productPicture.url
      }else if((aProduct.picture != undefined) && (aProduct.picture.length > 0)){
        if (aProduct.picture.startsWith('http') == false) {
          return 'https://www.menpercatalog.com/pictures/products/'+aProduct.picture;
        }
        else {
          return aProduct.picture;
        }  
      }
    }
    return '../../assets/product/default-product.jpeg';
  }

  // After any update to notify product refreshed
  private subscribeForProductEventChanged(){
    console.log("subscribeForProductEventChanged");
    this.productChacheSubscription = EventNotifier.getInstance().getSubject().subscribe(message=>{
      // console.log(message)
      if(message=="productRefreshed"){
        console.log("Product Cache Refreshed")
        this.reloadProductsFromCache()
      }
   })
  }
  pageChanged(event){
    // this.productlistByPage = [];
     this.p = event;
  }
}
