import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {
  username: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  currentPasswordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleCurrentPasswordVisibility() {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }

    const user = this.authService.getUserData();

    if (user) {
      if (user.password !== this.currentPassword) {
        alert('La contraseña actual es incorrecta');
        return;
      }

      const success = this.authService.updatePasswordByUsername(user.username, this.newPassword);

      if (success) {
        alert('Contraseña restablecida con éxito');
        this.goToLogin();
      } else {
        alert('Error al restablecer la contraseña');
      }
    } else {
      alert('Usuario no autenticado');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
