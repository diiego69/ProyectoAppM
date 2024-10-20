import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user: any = {};
  capturedImage: any;  

  constructor(private authService: AuthService, private router: Router, private menu: MenuController, ) { }

  ngOnInit() {
    this.user = this.authService.getUserData();
    if (!this.user) {
      this.router.navigate(['/start']);
    }
  }

  openMenu() {
    this.menu.open();
  }

  closeMenu() {
    this.menu.close();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
