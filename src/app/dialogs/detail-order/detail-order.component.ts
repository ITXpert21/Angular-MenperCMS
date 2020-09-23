import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-detail-order',
  templateUrl: './detail-order.component.html',
  styleUrls: ['./detail-order.component.css']
})
export class DetailOrderComponent implements OnInit {
  @ViewChild('content') content: ElementRef;

  order: any;
  amount: any;

  order_time : any;
  order_date : any;
  productlist=[];
  
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DetailOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { 
    this.order = data.order;
    this.order_time = new Date(this.order.order_time.seconds);
    var month = this.order_time.getUTCMonth() + 1; //months from 1-12
    var day = this.order_time.getUTCDate();
    var year = this.order_time.getUTCFullYear();

    this.order_date = month + "/" + day + "/" + year;
    this.productlist = this.order.products_arr;
  }

  ngOnInit() {
  }

  exportPDF(){
    // let doc =  new jsPDF();
    // let specialElementHandlers = {
    //   '#editor' : function(element, renderer){
    //     return true;
    //   }
    // };
    // let content = this.content.nativeElement;
    // doc.fromHTML(content.innerHTML, 15, 15,{
    //   'width' : 190,
    //   'elementHandlers' : specialElementHandlers
    // });
    // doc.save('test.pdf');

    html2canvas(document.querySelector("#content")).then(canvas => {
      var imgWidth = 208;   
      var pageHeight = 295;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  

      const contentDataURL = canvas.toDataURL('./../../assets/order/logo.png')  ;
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 0;  
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
      pdf.save(this.order.order_time.seconds + '.pdf'); // Generated PDF   
      this.dialogRef.close();
    });
  }

  getProductImage = (aProduct) => {
    if (aProduct.product_picture != undefined){

        if (aProduct.product_picture.startsWith('http') == false) {
          return 'https://www.menpercatalog.com/pictures/products/'+aProduct.product_picture;
        }
        else {
          return aProduct.product_picture;
        }  
    }
    return '../../assets/product/default-product.jpeg';
  }  
  cancelClick() {
    this.dialogRef.close();
  }

}
