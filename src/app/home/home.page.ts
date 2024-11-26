import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import axios from 'axios';
import { CapacitorBarcodeScanner } from '@capacitor/Barcode-Scanner';

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
      }
      this.ramos = this.authService.ramos;
      this.obtenerFotoPerfil();
    }

  getCurrentTime() {
    const now = new Date();
    this.currentHour = now.getHours();
    this.currentMinutes = now.getMinutes();
    this.horaAsistencia = this.currentHour*100 + this.currentMinutes;
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

  async scan(val?: number) {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: val || 17,
        cameraDirection: 1,
      });
      console.log(result);
      await this.getLocation();
      return result.ScanResult;
    } catch (e) {
      console.error('Error scanning barcode:', e);
      throw e;
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



  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;
      console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);

      let message: string;

      
      if (latitud >= -33.51163801421546 && latitud <= -33.49363801421546 && 
        longitud >= -70.66610907163472 && longitud <= -70.64810907163472
        ) {
        this.getCurrentTime();
        console.log(this.horaAsistencia);
        message = 'Estás en Duoc';
      } 
      else {
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