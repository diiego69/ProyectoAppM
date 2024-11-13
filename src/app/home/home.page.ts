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
  result: string = '';
  fotoPerfil: any;
  selectedView: string = 'inicio';

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.user = this.authService.getUserData();
    this.obtenerFotoPerfil();
    if (!this.authService.isLoggedIn()){
      this.router.navigate(['/start']);
    }
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
        message = 'Estás en Duoc';
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