import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { SuccessOkDialogComponent }
  from '../../dialogs/success-ok-dialog/success-ok-dialog.component';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Upload } from '../../models/upload.model';
import { UploadService } from '../../services/upload.service';
import { AuthService } from '../../services/auth.service';
import { SingletonClass } from '../../globals/menpersingletone';
import { AppHelpers } from '../../globals/menperhelpers';
import { async } from 'q';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {

  categorylist = [];
  product: any;

  productPicUpload: Upload;
  productPic: any;

  sub: any;
  productId: any;
  selectedCategory: any;
  filterCategoryItem = "";

  private categorySubscription: Subscription;

  constructor(fb: FormBuilder,
    private router: Router,
    public authService: AuthService,
    public upSvc: UploadService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.product = data.product;
    

    if(this.product.category != undefined)
      this.selectedCategory = this.product.category.id;
    if(this.product.category == undefined)
      this.selectedCategory = "";
      console.log("selectedCategory", this.selectedCategory);

  }

  ngOnInit() {
    this.updateCategoryList();

  }

  ngOnDestroy() {

    if (this.categorySubscription != undefined) {
      this.categorySubscription.unsubscribe();
    }

  }

  async updateCategoryList() {
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
    });

  }

  clickOnSave() {

    if (this.product.code == undefined || (this.product.code.length < 1)) {
      this.openInformDialog("Code not specified", "Please enter a valid code.");
      return;
    }

    if (this.product.name == undefined || (this.product.name.length < 1)) {
      this.openInformDialog("Name not specified", "Please enter a valid Name.");
      return;
    }

    if (this.product.quantity == undefined || (this.product.quantity.length < 1)) {
      this.openInformDialog("Quantity not specified", "Please enter a valid Quantity.");
      return;
    }

    if ((this.selectedCategory == undefined) || (this.selectedCategory.length < 1)) {
      this.openInformDialog("Category not specified", "Please select a valid Category.");
      return;
    }

    if (this.product.price == undefined || (this.product.price.length < 1)) {
      this.openInformDialog("Price not specified", "Please enter a valid Price.");
      return;
    }

    if (this.product.size == undefined || (this.product.size.length < 1)) {
      this.openInformDialog("Size not specified", "Please enter a valid Size.");
      return;
    }

    // if(this.product.flavor == undefined || (this.product.flavor.length < 1)) {
    //   this.openInformDialog("Flavor not specified", "Please enter a valid Flavor.");
    //   return;
    // }


    this.firestore.collection("product").doc(this.product.id).set({
      category_id: this.selectedCategory,
      code: this.product.code,
      description: this.product.description,
      flavor: this.product.flavor,
      name: this.product.name.toUpperCase(),
      price: this.product.price,
      quantity: this.product.quantity,
      size: this.product.size,
      update_by: this.authService.loggedInProfile.userId,
      update_time: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
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
          var productPicObj = tempArr[0];
          console.log("Error")
          this.firestore.collection("product").doc(this.product.id).set({
            productPicture: productPicObj,
          }, { merge: true })
            .then(async (aObj) => {
              this.dialogRef.close();
              this.openInformDialog("SUCCESS", "Product added successfully.");

              //navigate to product
              this.router.navigate(['product']);
              await AppHelpers.handleCacheChange();
            })
            .catch((error) => {
              console.log("Error", error);
              this.openInformDialog("Error", error.message);
            });
          // this.dialogRef.close();
          // this.openInformDialog("SUCCESS","Product updated successfully.");
          // await AppHelpers.handleCacheChange();
        } else {
          this.dialogRef.close();
          this.openInformDialog("SUCCESS", "Product updated successfully.");
        }
      })
      .catch((error) => {
        console.log("Error", error);
        this.openInformDialog("Error", error.message);
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


  openInformDialog(title = '', msg = ''): void {
    const dialogRef = this.dialog.open(SuccessOkDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.descr = msg;
    dialogRef.componentInstance.buttonTitle = "OK";

  }

  // clickOnReset(){
  //   this.product.reset();
  // }

  getProductImage(aProduct) {
    if (aProduct != undefined) {
      if ((this.productPicUpload != undefined) &&
        (this.productPicUpload.progress != undefined) &&
        (this.productPicUpload.progress == 100) && (this.productPicUpload.url != undefined)) {
        //  console.log(this.productPicUpload.url)
        return this.productPicUpload.url
      }
      else if ((aProduct.productPicture != undefined) && (aProduct.productPicture.url != undefined)) {
        return aProduct.productPicture.url
      } else if ((aProduct.picture != undefined) && (aProduct.picture.length > 0)) {
        if (aProduct.picture.startsWith('http') == false) {
          return 'https://www.menpercatalog.com/pictures/products/' + aProduct.picture;
        }
        else {
          return aProduct.picture;
        }
      }
    }
    return '../../assets/product/default-product.jpeg';
  }

  cancelClick() {
    this.dialogRef.close();
  }

}
