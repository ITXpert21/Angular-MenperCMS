import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'pagesinprogressfilter',
    pure: false
})
export class PagesInprogressFilterPipe implements PipeTransform {

  transform(items: any[], filterDate:Date = undefined): any[] {
    // console.log("PagesInprogressFilterPipe transform called");
   if (!items) {
     return items;
   }
   // filter items array, items which match and return true will be kept, false will be filtered out
   return items.filter((item: any) => {
        if ((item.isActive == undefined) || (item.isActive == false)) {
            return true;
        }
        return false;
   });
 }
}