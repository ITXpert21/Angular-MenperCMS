import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription, from } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Upload } from '../../models/upload.model';
import { UploadService } from '../../services/upload.service';
import { AuthService } from '../../services/auth.service';
// import { ApproveRejectDialogComponent } from '../dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { SuccessOkDialogComponent } from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';

@Component({
  selector: 'app-add-new-product',
  templateUrl: './add-new-product.component.html',
  styleUrls: ['./add-new-product.component.css']
})
export class AddNewProductComponent implements OnInit {
  productPicUpload: Upload;
  productPic: any;
  categorylist=[];
  product:any = {
    code:'',
    name:'',
    description:'',
    quantity:'',
    price:'',
    size:'',
    picture:'',
    flavor:'',
    // category:[]
    //selectedCategory : {},
  }

  productId:any;
  sub:any;
  selectedCategory:any;


  private categorySubscription: Subscription;

  constructor(private authService: AuthService, 
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private upSvc: UploadService,
    public dialogRef: MatDialogRef<AddNewProductComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:string
    ) { 
     
    }


  cancelClick() {
    this.dialogRef.close();
  }

  // updateCategoryList () {
  //   var aCollection = this.firestore.collection('category');
  //   // .snapshotChanges() returns a DocumentChangeAction[], which contains
  //   // a lot of information about "what happened" with each change. If you want to
  //   // get the data and the id use the map operator.
  //   this.categorySubscription = aCollection.snapshotChanges().pipe(
  //     map(actions => actions.map(a => {
  //       const data = a.payload.doc.data();
  //       const id = a.payload.doc.id;
  //       return { id, ...data };
  //     }))
  //   ).subscribe(categorylist => {
  //     this.categorylist = categorylist;
  //     // console.log(this.categorylist);
  //   });
  // }

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
      // console.log(this.rolelist);
    });

  }

  readProductPicURL(event) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = e => this.productPic = reader.result;

      reader.readAsDataURL(file);

      if ((this.productPicUpload != undefined) && (this.productPicUpload.url != undefined) &&
          (this.productPicUpload.url.length > 0) && (this.productPicUpload.uniqId != undefined) &&
          (this.productPicUpload.uniqId.length > 0)) {
            // Delete existing entry
            this.upSvc.deleteUpload(this.productPicUpload, 'productimages');
      }
      this.productPicUpload = new Upload(file);
      this.upSvc.pushUpload(this.productPicUpload, 'productimages');
    }
  }

  



  async clickOnSave(){
    
    if(this.selectedCategory == undefined) {
      this.openInformDialog("Category not specified", "Please select a valid Category.");
      return;
    }

    if(this.product.code == undefined || (this.product.code.length < 1)) {
      this.openInformDialog("Code not specified", "Please enter a valid code.");
      return;
    }

    if(this.product.name == undefined || (this.product.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid Name.");
      return;
    }

    if(this.product.description == undefined || (this.product.description.length < 1)) {
      this.openInformDialog("Description not specified", "Please enter a valid description.");
      return;
    }
    if(this.product.quantity == undefined || (this.product.quantity.length < 1)) {
      this.openInformDialog("Quantity not specified", "Please enter a valid Quantity.");
      return;
    }


    if(this.product.price == undefined || (this.product.price.length < 1)) {
      this.openInformDialog("Price not specified", "Please enter a valid Price.");
      return;
    }

    if(this.product.flavor == undefined || (this.product.flavor.length < 1)) {
      this.openInformDialog("Flavor not specified", "Please enter a valid Flavor.");
      return;
    }

    if(this.productPic == undefined || (this.productPic.length < 1)) {
      this.openInformDialog("Picture not specified", "Please enter a valid Picture.");
      return;
    }

    if(this.product.size == undefined || (this.product.size.length < 1)) {
      this.openInformDialog("Size not specified", "Please enter a valid Size.");
      return;
    }
    this.firestore.collection("product").add({
      create_by: this.authService.loggedInProfile.userId,
      create_time: firebase.firestore.FieldValue.serverTimestamp(),
      is_active:'Y',
      update_by: null,
      update_time: null,
      
    })
    .then(async (aObj) => {
      this.dialogRef.close();
      // this.openInformDialog("SUCCESS", "Product added successfully.");
      this.product.id = aObj.id;
      this.saveProduct();
      
    })
    .catch(err=> {
      console.log(err);
      this.dialogRef.close();
      this.openInformDialog("Error", err.message);
    })
  }

  saveProduct() {
    // const str = this.product.name;
    //var category = this.product.selectedCategory;
    console.log()
    this.firestore.collection('product').doc(this.product.id)
    .set({
      id:this.product.id,
      //category:this.product.category,
      category_id:this.selectedCategory.id,
      code:this.product.code,
      description:this.product.description,
      flavor:this.product.flavor,
      name:this.product.name.toUpperCase(),
      price:this.product.price,
      quantity:this.product.quantity,
      size:this.product.size,
      // picture: this.product.productPicObj,
      // Do not add createdAt here because we dont know its update or create
      // createdAt is being automatically added by cloud function
    },{merge: true})
    .then(() => {
      // user created. now create profile in firestore.

      if ((this.productPicUpload != undefined) && 
      (this.productPicUpload.progress != undefined) && 
      (this.productPicUpload.progress == 100) && 
      (this.productPicUpload.uniqId != undefined) && 
      (this.productPicUpload.uniqId.length > 0)) {
        var tempArr = new Array();

        tempArr.push({
          name: this.productPicUpload.name,
          url: this.productPicUpload.url,
          totalBytes: this.productPicUpload.totalBytes,
          uniqId: this.productPicUpload.uniqId
        });
        var productPicObj=tempArr[0];
        this.firestore.collection("product").doc(this.product.id).set({
          productPicture: productPicObj,
        }, {merge: true})
        .then(async () => {
          this.dialogRef.close();
          this.openInformDialog("SUCCESS","Product added successfully.");
  
          //navigate to product
          this.router.navigate(['product']);
          await AppHelpers.handleCacheChange();

        })
        .catch((error) => {
          console.log("Error", error);
          this.openInformDialog("Error", error.message);
        });
      } else {
        this.openInformDialog("SUCCESS","Product added successfully.");
      }
    })
    .catch((error) => {
      console.log("Error", error);
      this.openInformDialog("Error", error.message);
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

  clickOnReset(){
    this.product.code = '';
    this.product.name = '';
    this.product.description = '';
    this.product.quantity = '';
    this.selectedCategory = undefined;
    this.product.price ='';
    this.product.size ='';
    this.product.picture='';
    this.product.flavor='';
  } 

  ngOnInit() {
    this.updateCategoryList();

    this.sub = this.route.params.subscribe(params => {
      console.log(params);
      if(params['productId'] != undefined){
        this.productId = params['productId'];

        this.reloadData();
      } else {
        this.preProcessData();
      }
   });
  }

  reloadData() {
    this.firestore.collection('product').doc(this.productId).ref.get()
    .then((adoc) => {
      if (!adoc.exists) { 
        this.openInformDialog('Error', 'Product has been deleted. Contact support.');
        return; 
      }         
      this.product = adoc.data();
      this.product.id = adoc.id;
      console.log(this.product);

      this.preProcessData();

    })
    .catch((err) => {
      console.log(err.message);
    });
    
  }

  preProcessData() {

    if (this.product.productPicture != undefined) {
      this.productPic = this.product.productPicture.url;
    }

  }


  ngOnDestroy() {

    if (this.categorySubscription != undefined){
      this.categorySubscription.unsubscribe();
    }
    
  }

}
