import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-approve-reject-dialog',
  templateUrl: './approve-reject-dialog.component.html',
  styleUrls: ['./approve-reject-dialog.component.css']
})
export class ApproveRejectDialogComponent implements OnInit {

  title:string = '';
  descr:string = '';
  approveTitle:string = '';
  rejectTitle:string = '';
  refObject:any;


  constructor(public dialogRef: MatDialogRef<ApproveRejectDialogComponent>, @Inject(MAT_DIALOG_DATA) public data:string) {
    // this.title = data.title;
    // this.descr = data.descr;
   }

  ngOnInit() {
  }

  approveClick(): void {
    this.dialogRef.close(this.approveTitle);
  }

  rejectClick(): void {
    this.dialogRef.close(this.rejectTitle);
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
