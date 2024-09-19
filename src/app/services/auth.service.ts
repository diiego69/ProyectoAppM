import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users = [
    { id: 1, username: 'admin', password: 'admin', name: 'Administrador', carrera: 'administrador', jornada: 'Completa',},
    { id: 2, username: 'die.gonzalez', password: 'diego', name: 'Diego Gonzalez', carrera: 'Ing. Informatica', jornada: 'Vespertina',},
    { id: 3, username: 'bi.morales', password: 'benjamin', name: 'Benjamin Morales', carrera: 'Ing. Informatica', jornada: 'Vespertina',}
  ];

  constructor() { }

  getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  updatePasswordByUsername(username: string, newPassword: string): boolean {
    const user = this.getUserByUsername(username);
    if (user) {
      user.password = newPassword;

      const currentUser = this.getUserData();
      if (currentUser && currentUser.username === username) {
        currentUser.password = newPassword;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      return true;
    }
    return false;
  }

  getUserByUsername(username: string) {
    return this.users.find(user => user.username === username);
  }

  login(username: string, password: string): Observable<any> {
    const user = this.users.find(user => user.username === username && user.password === password);

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return of({ token: 'fake-jwt-token' }).pipe(delay(500));
    } else {
      return of(null).pipe(delay(500));
    }
  }

  getUserData() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('user');
  }
}