import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users = [
    { username: 'admin', password: 'admin', name: 'Administrador', carrera: 'administrador', jornada: 'Completa',},
    { username: 'diego', password: 'diego', name: 'Diego Gonzalez', carrera: 'Ing. Informatica', jornada: 'Vespertina',}
  ];

  constructor() { }

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