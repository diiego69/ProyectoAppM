import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuController, AlertController } from '@ionic/angular';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user: any = {};
  result: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.user = this.authService.getUserData();
    if (!this.user) {
      this.router.navigate(['/start']);
    }
  }

  openMenu() {
    this.menu.open();
  }

  closeMenu() {
    this.menu.close();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async scan(): Promise<void> {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
    });
    this.result = result.ScanResult;
    console.log(result.ScanResult);
    await this.getLocation();
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;
      console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);

      let message: string;

      "direccion para probar no estar en duoc (latitud >= -33.466 && latitud <= -33.464 && longitud >= -70.657 && longitud <= -70.655)"
      "direccion duoc (latitud >= -33.4701 && latitud <= -33.4681 && longitud >= -70.6354 && longitud <= -70.6334)"
      if (latitud >= -33.4701 && latitud <= -33.4681 && longitud >= -70.6354 && longitud <= -70.6334) {
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
}