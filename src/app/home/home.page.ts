import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user: any = {};
  horario: any = {};
  ramos: any[] = [];
  fotoPerfil: any;
  selectedView: string = 'inicio';
  currentHour: number = 0;
  currentMinutes: number = 0;
  horaAsistencia: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/start']);
      return;
    }
    this.user = this.authService.getUserData();
    if (this.user) {
      this.horario = this.authService.getHorarioByUserId(this.user.id);
      console.log('Horario cargado:', this.horario); 
    }
    this.ramos = this.authService.ramos;
    this.obtenerFotoPerfil();
    Geolocation.getCurrentPosition();
  }
  

  getCurrentTime() {
    const now = new Date();
    this.currentHour = now.getHours();
    this.currentMinutes = now.getMinutes();
    this.horaAsistencia = this.currentHour * 100 + this.currentMinutes;
  }

  getUserAndHorario() {
    const userData = this.authService.getUserData();
    if (userData) {
      this.user = userData;
      this.getUserSchedule(this.user.id);
    }
  }

  getUserSchedule(userId: number) {
    const horarios = this.authService.horario;
    const userSchedule = horarios.find((horario: any) => horario.id === userId);

    if (userSchedule) {
      this.horario = userSchedule;
    }
  }

  convertToTimeFormat(num: number): string {
    const hours = Math.floor(num / 100);
    const minutes = num % 100;
    return `${this.padTime(hours)}:${this.padTime(minutes)}`;
  }

  padTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  getRamoName(ramoId: number): string {
    const ramo = this.ramos.find((r: any) => r.id === ramoId);
    return ramo ? ramo.nombre : 'Desconocido';
  }

  async registrarAsistencia() {
    const diaActual = new Date().getDate();
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const diaIndex = this.getDiaDeLaSemana();
    console.log('Dia de la semana:', diaIndex);

    const clasesHoy = this.horario[diaIndex]; 

    if (!clasesHoy || !Array.isArray(clasesHoy)) {
      console.error('clasesHoy no tiene una estructura válida:', clasesHoy);
      return;
    }

    for (const clase of clasesHoy) {
      if (clase.modulo1) {
        for (const modulo of clase.modulo1) {
          if (
            this.horaAsistencia >= modulo.hora_inicio &&
            this.horaAsistencia <= modulo.hora_fin
          ) {
            const ramoId = modulo.ramo;
            this.registrarAsistenciaEnBaseDeDatos(ramoId, diaActual, mesActual, anioActual);
          }
        }
      } else {
        console.error('Clase sin módulos definidos:', clase);
      }
    }
  }

  registrarAsistenciaEnBaseDeDatos(ramoId: number, dia: number, mes: number, anio: number) {
    console.log(`Registrando asistencia: Ramo ${ramoId}, Fecha: ${dia}/${mes}/${anio}`);
    this.presentAlert(`Asistencia registrada para el ramo ${this.getRamoName(ramoId)} el ${dia}/${mes}/${anio}`);
  }

  getDiaDeLaSemana() {
    const now = new Date();
    return now.getDay(); // Devuelve un índice de 0 (Domingo) a 6 (Sábado)
  }

  async scan(): Promise<string[]> {
    try {
      const isSupported = await BarcodeScanner.isSupported();
      if (!isSupported.supported) {
        console.error('Barcode scanner no es compatible en este dispositivo.');
        return [];
      }

      const permissions = await BarcodeScanner.requestPermissions();
      if (permissions.camera !== 'granted' && permissions.camera !== 'limited') {
        console.error('Permisos de cámara no concedidos.');
        return [];
      }

      const { barcodes } = await BarcodeScanner.scan();

      try {
        await this.getLocation();
        console.log('Ubicación obtenida correctamente.');
      } catch (locationError) {
        console.error('Error al obtener la ubicación:', locationError);
      }

      try {
        await this.registrarAsistencia();
        console.log('Asistencia registrada correctamente.');
      } catch (asistenciaError) {
        console.error('Error al registrar asistencia:', asistenciaError);
      }

      return barcodes.map((barcode) => barcode.rawValue);
    } catch (error) {
      console.error('Error durante el escaneo:', error);
      throw error;
    }
  }

  openMenu() {
    this.menu.open();
  }

  closeMenu() {
    this.menu.close();
  }

  navigateToLogin() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async Asist() {
    try {
      this.getLocation();
    } catch (e) {
      console.error('Error al tomar asistencia:', e);
      throw e;
    }
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;
      console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);

      let message: string;

      if (
        latitud >= -33.599638 && latitud <= -33.403638 &&
        longitud >= -70.766109 && longitud <= -70.548109
      ) {
        console.log(this.horaAsistencia);
        try {
          await this.registrarAsistencia();
          message = 'Estás en Duoc.';
        } catch (error) {
          console.error('Error al registrar asistencia:', error);
          message = 'Error al registrar la asistencia.';
        }
      } else {
        message = 'No estás en Duoc.';
      }

      await this.presentAlert(message);
    } catch (error) {
      console.error('No se pudo encontrar ubicación:', error);
      await this.presentAlert('Error al obtener la ubicación.');
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Asistencia',
      message: message,
      buttons: ['Entendido'],
    });

    await alert.present();
  }

  async obtenerFotoPerfil() {
    try {
      const response = await axios.get('https://randomuser.me/api/');
      const foto = response.data.results[0].picture.large;
      this.fotoPerfil = foto;
    } catch (error) {
      console.error('Error al obtener la foto de perfil', error);
    }
  }
}
