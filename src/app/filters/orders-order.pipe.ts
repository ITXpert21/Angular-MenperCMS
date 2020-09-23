import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'ordesorder',
    pure: false
})
export class OrdersOrderPipe implements PipeTransform {
    transform(items: any[]): any[] {
        //  console.log("OrdersOrderPipe transform called");
        if (!items || items == undefined || items.length == 0) {
          return items;
        }
    
        items.sort( (a: any, b: any) => {
            if(a.order_time == undefined){
                return -1;
            }
            if(b.order_time == undefined){
                return -1;
            }
            if (a.order_time > b.order_time) {
                return -1;
            } else if (a.order_time < b.order_time) {
                return 1;
            } else {
                return 0;
            }
        });
        return items;
    }
  
}