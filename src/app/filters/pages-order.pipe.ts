import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'pagesorder',
    pure: false
})
export class PagesOrderPipe implements PipeTransform {
  transform(items: any[]): any[] {
    //  console.log("AssignmentOrderPipe transform called");
    if (!items || items == undefined || items.length == 0) {
      return items;
    }

    items.sort( (a: any, b: any) => {
        
        if (a.pageIdentifier < b.pageIdentifier) {
            return -1;
        } else if (a.pageIdentifier > b.pageIdentifier) {
            return 1;
        } else {
            return 0;
        }
    });
    return items;
  }
  
}