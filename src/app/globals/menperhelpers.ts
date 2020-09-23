import {SingletonClass} from './menpersingletone';
import {  LocalStorage } from '@ngx-pwa/local-storage';

export const AppHelpers = Object.freeze({
    localStorage : LocalStorage,

    async handleCacheChange() {
        let cachesDict = SingletonClass.getInstance().get('cachesdict');
        // console.log('handleCacheChange called ' + cachesDict)
        // let cachesDict = Object.keys(SingletonClass.get('cachesdict'));
        if ((cachesDict == undefined) || (cachesDict == null)) {
            return;
        }
        cachesDict.forEach(async element => {
            if (element.product != undefined) {
                await  AppHelpers.refreshCollectionCacheFromUrl(element.product, 'product', 'products');
            }
            if (element.category != undefined) {
                await  AppHelpers.refreshCollectionCacheFromUrl(element.category, 'category', 'categories');
            }
            if (element.client != undefined) {
                await  AppHelpers.refreshCollectionCacheFromUrl(element.client, 'client', 'clients');
            }          
        });

    },
    async refreshCollectionCacheFromUrl(cacheDict, collectionName, jsonKeyForArray) {
        // console.log(cacheDict);
      if ((cacheDict == undefined) || (cacheDict == null)) {
          return;
      }
      if ((cacheDict.cacheUrl == undefined) || (cacheDict.cacheUrl == null)) {
          return;
      }
      if ((cacheDict. cacheTimestamp == undefined) || (cacheDict.cacheTimestamp == null)) {
          return;
      }

      let cacheDate = new Date(cacheDict.cacheTimestamp.toDate());
      if ((cacheDate == undefined) || (cacheDate == null)) {
          return;
      }

      let cacheKeyName = jsonKeyForArray+'dict';
      let cacheTimestampKeyName = jsonKeyForArray+'CacheTimestamp';

      var shouldUpdate = false;
      let existingCacheTimestamp = SingletonClass.getInstance().get(cacheTimestampKeyName);
      if (existingCacheTimestamp == undefined) {
          console.log('existingCacheTimestamp undefined for '+cacheTimestampKeyName);
          shouldUpdate = true;
      } else {
          if (cacheDate.getTime() > existingCacheTimestamp.getTime()) {
              console.log('existingCacheTimestamp for '+cacheTimestampKeyName+' behind server cache timestamp');
              shouldUpdate = true;
          }
      }

      if (SingletonClass.getInstance().get(cacheKeyName) == undefined) {
          console.log('Oops, cache not loaded yet for '+cacheKeyName);
          shouldUpdate = true;
      }

      if (shouldUpdate == true) {
        let res = await fetch(cacheDict.cacheUrl);
        //   let res = await this.http(cacheDict.cacheUrl);
        //   console.log(res);
          let jsonObject = await res.json();
          
          SingletonClass.getInstance().set(cacheKeyName,jsonObject[jsonKeyForArray]);
          SingletonClass.getInstance().set(cacheTimestampKeyName,cacheDate);

          let dateStr = ''+cacheDate.getTime()+'';
          console.log(dateStr);
          let cacheStr = JSON.stringify(jsonObject[jsonKeyForArray]);
          await localStorage.setItem(cacheKeyName,cacheStr);
          await localStorage.setItem(cacheTimestampKeyName,dateStr);

        //   console.log(cacheKeyName);
        //   console.log(SingletonClass.getInstance().get(cacheKeyName));
          
      } else {
          console.log('refreshCollectionCacheFromUrl: '+collectionName+' is already up to date');
      }
  },

  async reloadCacheFromAsyncStorageIfAny() {
      console.log('reloadCacheFromAsyncStorageIfAny');

      var aStr = await localStorage.getItem('productsCacheTimestamp');
      console.log('productsCacheTimestamp');
      console.log(aStr);
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0) && (aStr != "NaN")) {
          let aNum = Number(aStr);
          let aDate = new Date(aNum);
          SingletonClass.getInstance().set('productsCacheTimestamp',aDate);
      } 
      aStr = await localStorage.getItem('categoriesCacheTimestamp');
      console.log('categoriesCacheTimestamp='+aStr);
      console.log(aStr);
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0) && (aStr != "NaN")) {
          let aNum = Number(aStr);
          let aDate = new Date(aNum);
          SingletonClass.getInstance().set('categoriesCacheTimestamp',aDate);
      } 
      aStr = await localStorage.getItem('clientsCacheTimestamp');
      console.log('clientsCacheTimestamp='+aStr);
      console.log(aStr);
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0) && (aStr != "NaN")) {
          let aNum = Number(aStr);
          let aDate = new Date(aNum);
          SingletonClass.getInstance().set('clientsCacheTimestamp',aDate);
      }

     

      aStr = await localStorage.getItem('productsdict');
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0)) {
        SingletonClass.getInstance().set('productsdict',JSON.parse(aStr));
      }

      
      aStr = await localStorage.getItem('categoriesdict');
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0)) {
        SingletonClass.getInstance().set('categoriesdict',JSON.parse(aStr));
      }

     
      aStr = await localStorage.getItem('clientsdict');
      if ((aStr != null) && (aStr != undefined) && (aStr.length > 0)) {
        SingletonClass.getInstance().set('clientsdict',JSON.parse(aStr));
      }
  } 

    
      
});