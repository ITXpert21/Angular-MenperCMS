import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'categoryFilter',
  pure: false
})
export class CategoryFilterPipe implements PipeTransform {
  // transform(items: any, term: any): any {
  //   if (term === undefined) return items;

  //   return items.filter(function(product) {
  //       return product.category.toLowerCase().includes(term.toLowerCase());
  //   })
  // }
  transform(value: any, args?: any): any {

    if(!value)return null;
    if(!args)return value;

    args = args.toLowerCase();

    return value.filter(function(product){
      if((product.category != undefined) && (product.category.name != undefined)){
        return JSON.stringify(product.category.name).toLowerCase().includes(args);
      }
    });
  }
 
}





