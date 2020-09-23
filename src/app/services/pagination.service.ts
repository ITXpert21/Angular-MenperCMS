import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/take';
import { functions } from 'firebase';
import { Subscription } from 'rxjs';


interface QueryConfig {
  path: string, //  path to collection
  field: string, // field to orderBy
  limit: number, // limit per query
  reverse: boolean, // reverse order?
  prepend: boolean // prepend to source?
}


@Injectable({
  providedIn: 'root'
})

export class PaginationService {

  private currentSubscription:Subscription;
private query: QueryConfig;

// Observable data
data: Observable<any>;
done: Observable<boolean>;
loading: Observable<boolean>;
private _data;
private _loading;
private _done;

  constructor(private firestore: AngularFirestore) { }

   // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: any) {
    this.query = { 
      path,
      field,
      limit:50, 
      reverse: false,
      prepend: false,
      ...opts
    }

    const first = this.firestore.collection(this.query.path, ref => {
      return ref
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
    })
    this. _data=new BehaviorSubject([]);
    this._loading=new BehaviorSubject(false);
    this._done=new BehaviorSubject(false);
    this.data = this._data.asObservable()
    this.loading=this._loading.asObservable();
    this.done=this._done.asObservable();
    this.mapAndUpdate(first);
    
  }

  // Retrieves additional data from firestore
  more() {
    
    const cursor = this.getCursor()    
    const more = this.firestore.collection(this.query.path, ref => {
      return ref
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor)
    })
    this.mapAndUpdate(more)
  }


   // Determines the doc snapshot to paginate query 
   private getCursor() {
    const current = this._data.value
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc 
    }
    return null
  }


  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection) {
      if (this._done.value || this._loading.value) { 
        return 
      };

    // loading

    this._loading.next(true)

    // unsubscribe. No point in receiving previous block changes
    if(this.currentSubscription != undefined){
      this.currentSubscription.unsubscribe();
      this.currentSubscription = undefined
    }

    this.currentSubscription = col.snapshotChanges().subscribe(actionArray=>{
      let values=actionArray.map(item=>{
        // console.log(actionArray)
        const data=item.payload.doc.data();
        const doc=item.payload.doc
        return {
          ... data,
          doc:doc
        }
      })

    values = this.query.prepend ? values.reverse() : values
    //this.data=this._data.asObservable
    this._data.next(values)
    this._loading.next(false)
       if (!values.length) {
            this._done.next(true)
          }
    })

    // Map snapshot with doc ref (needed for cursor)
    // return col.snapshotChanges()
    //   .do(arr => {
    //     let values = arr.map(snap => {
    //       console.log(snap.payload)
    //       const data = snap.payload.doc.data()
    //       const doc = snap.payload.doc
    //       return { ...data, doc }
    //     })

    //   // If prepending, reverse the batch order

    //     values = this.query.prepend ? values.reverse() : values

    //   // update source with new values, done loading
    //     this._data.next(values)
    //     this._loading.next(false)

    //     // no more values, mark done
    //     if (!values.length) {
    //       this._done.next(true)
    //     }
    // })
    // .take(1)
    // .subscribe()

  }

  
}
