import { Injectable } from '@angular/core';
import { of, Observable, BehaviorSubject} from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface Ramo {
  id: number;
  alumnoId: string;
  nombre: string;
  siglas: string;
}

interface Usuario{
  id: number;
  name: string;
  password: string;
  fullname: string;
  email: string;
  jornada: string;
  carrera: string;
  horario: number;
  asistencia: number;
}

interface Registro {
  id_clase: number;
  dia: number;
  mes: number;
  anio: number;
}

interface Asistencia {
  id: number;
  registro: Registro[];
}

interface Horario{
  id: number;
  Lunes:[];
  Martes:[];
  Miercoles:[];
  Jueves:[];
  Viernes:[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuarios: Usuario[] = [];
  ramos: Ramo[] = [];
  horario: Horario[] = [];
  asistencia: Asistencia[] = [];
  private dataLoadedSubject = new BehaviorSubject<boolean>(false);


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
        this.asistencia = data['asistencia'];
        this.dataLoadedSubject.next(true);
      });
  }

  waitForDataLoaded(): Observable<boolean> {
    return this.dataLoadedSubject.asObservable();
  }

  getUserById(id: number): Usuario | undefined {
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

  getUserByUsername(username: string): Usuario | undefined {
    return this.usuarios.find(user => user.name === username);
  }

  login(username: string, password: string): Observable<any> {
    const user = this.usuarios.find(user => user.name === username && user.password === password);

    if (user) {
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
  
  getAsistenciaByUserId(userId: number): Asistencia | null {
    const user = this.usuarios.find((usuario: any) => usuario.id === userId);
    if (!user) return null;

    const asistenciaData = this.asistencia.find((asistencia: Asistencia) => asistencia.id === user.asistencia);
    if (!asistenciaData) {
      console.error(`Asistencia no encontrada para el usuario con ID: ${userId}`);
      return null;
    }

    return asistenciaData;
  }

  getRegistrosByUserId(userId: number): Registro[] | null {
    const asistenciaData = this.getAsistenciaByUserId(userId);
    return asistenciaData ? asistenciaData.registro : null;
  }

  logout() {
    localStorage.clear();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  }
}