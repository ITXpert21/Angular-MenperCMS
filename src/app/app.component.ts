import { Component } from '@angular/core';
import { SingletonClass } from './globals/menpersingletone';
import { AppHelpers } from './globals/menperhelpers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MenperCMS';
  ngOnInit() {
    AppHelpers.reloadCacheFromAsyncStorageIfAny();
  }
}
