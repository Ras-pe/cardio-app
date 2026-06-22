import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter {
  userEmail = '';

  constructor(private auth: AuthService) {}

  ionViewWillEnter(): void {
    this.userEmail = this.auth.getUserEmail();
  }

  logout() {
    this.auth.logout();
  }
}
