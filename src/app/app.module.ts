import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatSelectModule } from '@angular/material/select';
// import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
// import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
// Import library module
// import { NgxSpinnerModule } from 'ngx-spinner';
import {UANumberOnlyDirective} from './directives/uanumberonly-directive';

//Services
import {AlertComponent} from './directives/alert.component';
import {AlertService} from './services/alert.service';
import { Alert } from './models/alert';
import { MessagingService } from './services/messaging.service';
import { UploadService } from'./services/upload.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/authGuard.service';
import { PaginationService } from './services/pagination.service';

// Material Module
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, 
  MatSidenavModule, 
  MatIconModule, 
  MatListModule, 
  MatCardModule } from '@angular/material';
import {MatRadioModule} from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { MatDatepickerModule,  } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';

// App Page Component
import { LoginComponent } from './login/login.component';
import { CmsProfileComponent } from './cms-profile/cms-profile.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { CategoryComponent } from './category/category.component';
import { ProductComponent } from './product/product.component';
import { RoleComponent } from './role/role.component';
import { SalespersonComponent } from './salesperson/salesperson.component';
import { ClientComponent } from './client/client.component';
import { OrderComponent } from './order/order.component';
import { NotificationComponent } from './notification/notification.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { FirestoreSettingsToken } from '@angular/fire/firestore';
// import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from 'angularfire2/functions';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireMessagingModule } from 'angularfire2/messaging';
import { AngularFireStorageModule } from 'angularfire2/storage';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';


import { environment } from '../environments/environment';

// Dialog Component
import { AddNewCategoryComponent } from './dialogs/add-new-category/add-new-category.component';
import { AddNewProductComponent } from './dialogs/add-new-product/add-new-product.component';
import { AddNewRoleComponent } from './dialogs/add-new-role/add-new-role.component';
import { AddNewSalesComponent } from './dialogs/add-new-sales/add-new-sales.component';
import { AddNewClientComponent } from './dialogs/add-new-client/add-new-client.component';
import { AddNewNotificationComponent } from './dialogs/add-new-notification/add-new-notification.component';
import { EditCategoryComponent } from './dialogs/edit-category/edit-category.component';
import { EditProductComponent } from './dialogs/edit-product/edit-product.component';
import { EditRoleComponent } from './dialogs/edit-role/edit-role.component';
import { EditSalesComponent } from './dialogs/edit-sales/edit-sales.component';
import { EditClientsComponent } from './dialogs/edit-clients/edit-clients.component';
import { EditNotificationComponent } from './dialogs/edit-notification/edit-notification.component';
import { NotificationDetailsComponent } from './dialogs/notification-details/notification-details.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';
import { SuccessOkDialogComponent } from './dialogs/success-ok-dialog/success-ok-dialog.component';
import { ApproveRejectDialogComponent } from './dialogs/approve-reject-dialog/approve-reject-dialog.component';
import { NoticeDetailsDialogComponent } from './dialogs/notice-details-dialog/notice-details-dialog.component';
import { DetailOrderComponent } from './dialogs/detail-order/detail-order.component';


// Filters
import { PagesOrderPipe } from './filters/pages-order.pipe';
import { PagesActiveFilterPipe } from './filters/pages-activefilter.pipe';
import { PagesInprogressFilterPipe } from './filters/pages-inprogressfilter.pipe';
import { ScrollableDirective } from './directives/scrollable.directive';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { CategoryFilterPipe } from './filters/category-filter.pipe';
import { SalespersonFilterPipe } from './filters/salesperson-filter.pipe';
import { OrdersOrderPipe } from './filters/orders-order.pipe';


import { from } from 'rxjs';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//page navigation with table
import { NgxPaginationModule } from 'ngx-pagination';

// router naviagtion of pages
const ROUTES: Route[] = [
  { path: '', redirectTo:'login', pathMatch:'full' },
  { path: 'login', component: LoginComponent },
  { path: 'password-recovery', component: PasswordRecoveryComponent },
  
  /* Common part */
  { path: 'authaction', component: VerifyEmailComponent},
  { 
    path: '', 
    component: CmsProfileComponent,
    children: [
      { path: 'category', component: CategoryComponent, canActivate: [AuthGuard]},
      { path: 'product', component: ProductComponent, canActivate: [AuthGuard]},
      { path: 'role', component: RoleComponent, canActivate: [AuthGuard]},
      { path: 'sale', component: SalespersonComponent, canActivate: [AuthGuard]},
      { path: 'client', component: ClientComponent, canActivate: [AuthGuard]},
      { path: 'order', component: OrderComponent, canActivate: [AuthGuard]},
      { path: 'notification', component: NotificationComponent, canActivate: [AuthGuard]},

    ]
  }
]

@NgModule({
  declarations: [
    AppComponent,
    UANumberOnlyDirective,
    PagesOrderPipe,
    PagesActiveFilterPipe,
    PagesInprogressFilterPipe,
    LoginComponent,
    CmsProfileComponent,
    CategoryComponent,
    NavigationComponent,
    PasswordRecoveryComponent,
    AddNewCategoryComponent,
    ProductComponent,
    RoleComponent,
    SalespersonComponent,
    ClientComponent,
    OrderComponent,
    NotificationComponent,
    AddNewRoleComponent,
    AddNewSalesComponent,
    AddNewClientComponent,
    AddNewProductComponent,
    AddNewNotificationComponent,
    EditCategoryComponent,
    DeleteDialogComponent,
    EditProductComponent,
    EditRoleComponent,
    EditSalesComponent,
    EditClientsComponent,
    EditNotificationComponent,
    NotificationDetailsComponent,
    SuccessOkDialogComponent,
    ScrollableDirective,
    LoadingSpinnerComponent,
    CategoryFilterPipe,
    SalespersonFilterPipe,
    ApproveRejectDialogComponent,
    AlertComponent,
    NoticeDetailsDialogComponent,
    OrdersOrderPipe,
    DetailOrderComponent,
    VerifyEmailComponent
    
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AngularFireFunctionsModule,
    AngularFireMessagingModule,
    NgxPaginationModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBT4-avcOT157sFDKnLH-le6Hu0o8ETvXI' // by Bharat on bharat.biswal@gmail.com
    // }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule, HttpClientModule,
    RouterModule.forRoot(ROUTES , {useHash: true}),
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatBadgeModule,
    MatGridListModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatSelectModule,
    NgbModule
  ],
  entryComponents: [
    AddNewCategoryComponent,
    AddNewProductComponent,
    AddNewRoleComponent,
    AddNewSalesComponent,
    AddNewClientComponent,
    AddNewNotificationComponent,
    EditCategoryComponent,
    EditProductComponent,
    EditRoleComponent,
    EditSalesComponent,
    EditClientsComponent,
    EditNotificationComponent,
    NotificationDetailsComponent,
    DeleteDialogComponent,
    SuccessOkDialogComponent,
    ApproveRejectDialogComponent,
    DetailOrderComponent,
    NoticeDetailsDialogComponent
  ],
  providers: [ AuthGuard, AuthService, UploadService, PaginationService, 
    AlertService, MessagingService,
    AsyncPipe, {provide: FirestoreSettingsToken, useValue: {}}],
  bootstrap: [AppComponent]
})
export class AppModule { }
