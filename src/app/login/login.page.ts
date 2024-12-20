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
  errorMessage: string = '';
  currentPasswordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router,) { }

  togglePasswordVisibility() {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  onSubmit() {
    const minUsername = this.username.toLocaleLowerCase();
    this.authService.login(minUsername, this.password).subscribe(
        response => {
            if (response) {
                this.router.navigate(['/home']);
                this.username = '';
                this.password = '';
            } else {
              this.errorMessage = 'Credenciales incorrectas';
              alert(this.errorMessage);
            }
        },
        error => {
          console.error('Error durante el inicio de sesión', error);
          this.errorMessage = 'Ocurrió un error durante el inicio de sesión';
          alert(this.errorMessage);
        }
    );
  }

  navigateToChangePassword(){
    this.router.navigate(['/change-password']);
  }

  goToback() {
    this.router.navigate(['/start']);
  }
}
