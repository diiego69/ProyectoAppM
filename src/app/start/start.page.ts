import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
