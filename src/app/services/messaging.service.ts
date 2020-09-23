import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireMessaging } from 'angularfire2/messaging';
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireFunctions } from 'angularfire2/functions';
import * as firebase from 'firebase/app';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  token:any;

  constructor(
    private firestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private authService: AuthService,
    private alertService: AlertService,
    private angularFireFunctions: AngularFireFunctions,
    private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }

  /**
   * update token in firebase database
   * 
   * @param userId userId as a key 
   * @param token token as a value
   */
  updateToken(userId, token) {
    // we can change this function to request our backend service
    var aToken="";
    if ((token != undefined) && (token != null) && (token.length > 0)) {
      aToken = token;
    } else {
      return;
    }

    this.firestore.collection('fcmTokens').doc(userId).ref.get()
        .then((adoc) => {
          var fcmData = undefined;
          if (adoc.exists) { 
            fcmData = adoc.data();
          }         
          
          //console.log(fcmData);
          var alreadyExists = false;
          if (fcmData == undefined) {
            var arr = new Array();
            arr.push(aToken);
            fcmData = {"webapp":arr };
          } else if (fcmData["webapp"] == undefined) {
            fcmData["webapp"] = arr;
          } else {
            arr = fcmData["webapp"];
            for(var k=0; k< arr.length; k++) {
              const tok = arr[k];
              if (tok == aToken) {
                alreadyExists = true;
              }
            }
            if (alreadyExists == false) {
              arr.push(aToken);
            }
          }

          if (alreadyExists == false) {
            this.firestore.collection('fcmTokens').doc(userId).set(
             fcmData, {merge: true}
            ).then(). catch((err) => {
                console.log(err);
            });
          }
        }).catch((err) => {
          console.log(err);
      });

     // Also subscribe to topic=userId to receive FCM messages from CLoud functions
     this.angularFireFunctions.httpsCallable('subscribeToTopic')
     ({topic: userId, token:aToken})
     .toPromise()
     .then()
     .catch((err) => {
         console.log(err);
     });
     
  }

  unlinkTokenFromUserId(userId) {
    var aToken="";
    if ((this.token != undefined) && (this.token != null) && (this.token.length > 0)) {
      aToken = this.token;
    } else {
      return;
    }

    this.firestore.collection('fcmTokens').doc(userId).ref.get()
        .then((adoc) => {
          if (!adoc.exists) { 
            return; 
          }         
          var fcmData = adoc.data();
          //console.log(fcmData);
          var doesExists = false;
          if (fcmData == undefined) {
          } else if (fcmData["webapp"] == undefined) {
          } else {
            var arr = fcmData["webapp"];
            for(var k=0; k< arr.length; k++) {
              const tok = arr[k];
              if (tok == aToken) {
                doesExists = true;
              }
            }
            if (doesExists == true) {
              // delete from array
              for (var i=arr.length-1; i>=0; i--) {
                  if (arr[i] === aToken) {
                      arr.splice(i, 1);
                  }
              }
              fcmData["webapp"] = arr; 
            }
          }

          if (doesExists == true) {
            this.firestore.collection('fcmTokens').doc(userId).set(
             fcmData, {merge: true}
            ).then(). catch((err) => {
                console.log(err);
            });
          }
        }).catch((err) => {
          console.log(err);
      });

     // Also unsubscribe from topic=userId to receive FCM messages from CLoud functions
     this.angularFireFunctions.httpsCallable('unsubscribeFromTopic')({topic: userId, token:aToken})
     .toPromise()
     .then()
     .catch((err) => {
         console.log(err);
     });
  }

  /**
   * request permission for notification from firebase cloud messaging
   * 
   * @param userId userId
   */
  requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
        this.token = token;
        this.updateToken(userId, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  /**
   * hook method when new notification received in foreground
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log("new message received. ", payload);
        this.currentMessage.next(payload);

        if ((this.authService.loggedInProfile.sendNotifications == undefined) || 
            (this.authService.loggedInProfile.sendNotifications == true)) {
          this.alertService.success(this.currentMessage.getValue().notification.title);
        }
      });
  }
}