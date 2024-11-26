import { Injectable } from '@angular/core';
import { of, Observable, BehaviorSubject} from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuarios: any[] = [];
  ramos: any[] = [];
  horario: any[] = [];
  private dataLoadedSubject = new BehaviorSubject<boolean>(false);
  private loggedIn = false;

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
}

  constructor(private http: HttpClient) {
    this.loadData();
   }

   loadData() {
    this.http.get('assets/bd.json')
      .subscribe((data: any) => {
        this.usuarios = data['usuarios'];
        this.ramos = data['ramos'];
        this.horario = data['horario'];
      });
  }

  waitForDataLoaded(): Observable<boolean> {
    return this.dataLoadedSubject.asObservable();
  }

  getUserById(id: number) {
    return this.usuarios.find(user => user.id === id);
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
    return this.usuarios.find(user => user.name === username);
  }

  login(username: string, password: string): Observable<any> {
    const user = this.usuarios.find(user => user.name === username && user.password === password);
  
    if (user) {
      this.loggedIn = true;
      localStorage.setItem('isLoggedIn', 'true');
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

  getHorarioByUserId(userId: number) {
    const user = this.usuarios.find((usuario: any) => usuario.id === userId);
    if (!user) return {};

    const horarioData = this.horario.find((horario: any) => horario.id === user.horario);
    if (!horarioData) {
        console.error(`Horario no encontrado para el usuario con ID: ${userId}`);
        return {};
    }
    
    return horarioData;
}

  logout() {
    localStorage.clear();
    this.loggedIn = false;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  }
}