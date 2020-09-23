import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map, max } from 'rxjs/operators';
import {FormControl, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css']
})
export class DeleteDialogComponent implements OnInit {

  title:string = '';
  descr:string = '';
  deleteTitle:string = '';
  cancelTitle:string = '';
  
  constructor(fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DeleteDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data:any) { 
      console.log(data);
    }

  ngOnInit() {
  }

  deleteClick(): void {
    this.dialogRef.close(this.deleteTitle);
  }
  // approveClick(): void {
  //   this.dialogRef.close(this.approveTitle);
  // }

  cancelClick() {
    this.dialogRef.close();
  }

}
