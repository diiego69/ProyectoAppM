import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuController } from '@ionic/angular';
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint, CapacitorBarcodeScannerTypeHintALLOption } from '@capacitor/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user: any = {};
  capturedImage: any;  

  constructor(private authService: AuthService, private router: Router, private menu: MenuController, ) { }

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
  result: string = ''

  async scan(): Promise<void> {
    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.ALL
    });
    this.result = result.ScanResult
    this.getLocation();
    console.log(result.ScanResult);
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;
      console.log(`Latitud: ${latitud}, Longitud: ${longitud}`);
  
      if (latitud >= -33.468 && latitud <= -33.467 && longitud >= -70.635 && longitud <= -70.634) {
        console.log('tabien.');
      } else {
        console.log('tamal.');
      }
    } catch (error) {
      console.error('No se pudo encontrar ubicacion:', error);
    }
  }
}