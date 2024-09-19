import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  currentPasswordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  togglePasswordVisibility() {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  onSubmit() {
    const minUsername = this.username.toLocaleLowerCase();
    this.authService.login(minUsername, this.password).subscribe(
      response => {
        if (response) {
          this.router.navigate(['/home']);
        } else {
          alert('Credenciales incorrectas');
        }
      },
      error => {
        console.error('Error durante el inicio de sesión', error);
        alert('Ocurrió un error durante el inicio de sesión');
      }
    );
  }

  navigateToChangePassword(){
    this.router.navigate(['/change-password']);
  }
}
