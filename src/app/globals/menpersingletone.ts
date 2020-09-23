import { Observable } from "rxjs";
import { EventNotifier } from "./EventNotifier";

export class SingletonClass {
  private static instance: SingletonClass;
  private _data;
  
  productChangeObservable=new Observable((observer)=>{})
  static getInstance() {
    if (!SingletonClass.instance) {
      SingletonClass.instance = new SingletonClass();
      SingletonClass.instance._data = {
        loggedinprofile: null
      }
    }
    return SingletonClass.instance;
  }
    //rest is the same code as preceding example
    set(key, value){
      this._data[key] = value;
      
      // to notify product refreshed after any update
      if(key=="productsdict"){
          console.log("Called In Single ton")
          EventNotifier.getInstance().sendMessage("productRefreshed")
      }
      // to notify category refreshed after any update
      if(key=="categoriesdict"){
        console.log("Called In Single ton")
        EventNotifier.getInstance().sendMessage("categoryRefreshed")
      }
      // to notify client refreshed after any update
      if(key=="clientsdict"){
        console.log("Called In Single ton")
        EventNotifier.getInstance().sendMessage("clientRefreshed")
      }
    }

    get(key){
      return this._data[key];
    }
  
}

// const SingletonClassInstance = new SingletonClass();
// Object.freeze(SingletonClassInstance);
const SingletonClassInstance = SingletonClass.getInstance();
Object.freeze(SingletonClassInstance);
export default SingletonClassInstance;
