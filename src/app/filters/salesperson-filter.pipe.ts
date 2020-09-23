import { Pipe, PipeTransform } from '@angular/core';
// import { userInfo } from 'os';

@Pipe({
  name: 'salespersonFilter'
})
export class SalespersonFilterPipe implements PipeTransform {

  transform(items: any[], term: any): any[] {
    if (term === undefined || term ==="") return items;
    
    

    return items.filter(sel =>{
      if(sel.user_id==term){
        return sel;
      }
    })

  }

}
