import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-success-ok-dialog',
  templateUrl: './success-ok-dialog.component.html',
  styleUrls: ['./success-ok-dialog.component.css']
})
export class SuccessOkDialogComponent implements OnInit {

  title:string = '';
  subtitle:string = '';
  descr:string = '';
  buttonTitle:string = '';

  constructor(public dialogRef: MatDialogRef<SuccessOkDialogComponent>, @Inject(MAT_DIALOG_DATA) public data:string) { }

  ngOnInit() {
  }

  okClick(): void {
    this.dialogRef.close(this.buttonTitle);
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
