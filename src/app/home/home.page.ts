  import { Component , OnInit, OnDestroy } from '@angular/core';
  import { Router } from '@angular/router';
  import { AuthService } from '../services/auth.service';
  import { MenuController, AlertController } from '@ionic/angular';
  import { Geolocation } from '@capacitor/geolocation';
  import axios from 'axios';
  import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

  interface Ramo {
    id: number;
    alumnoId: string;
    nombre: string;
    siglas: string;
  }

  interface Asistencia {
    id: string;
    alumnoId: string;
    ramoId: string;
    fecha: Date;
  }

  @Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
  })

  export class HomePage implements OnInit, OnDestroy {
    user: any = {};
    horario: any = {};
    ramos: Ramo[] = [];
    fotoPerfil: any;
    selectedView: string = 'inicio';
    currentHour: number = 0;
    currentMinutes: number = 0;
    horaAsistencia: number = 0;
    asistencia: Asistencia [] = [];
    mensajes: string[] = [ 
      'Les recordamos estar atentos a sus correos para saber cuando rendir sus examenes',
      'La información respecto a su estado de asistencia será informada el 30 de noviembre',
      'Las personas con "RA" no pueden rendir examenes'
    ]; 
    mensajeActual: string = '';
    intervalo: any;

    constructor(
      private authService: AuthService,
      private router: Router,
      private menu: MenuController,
      private alertController: AlertController
    ) {
       this.obtenerMensajeAleatorio();
    }

    ngOnInit() {
      Geolocation.getCurrentPosition();
      this.getCurrentTime();
      this.intervalo = setInterval(() => {
        this.obtenerMensajeAleatorio();
      }, 15000);

      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/start']);
        return;
      }
      this.user = this.authService.getUserData();
      if (this.user) {
        this.horario = this.authService.getHorarioByUserId(this.user.id);
        console.log('Horario cargado:', this.horario);
        this.cargarAsistenciasUsuario();
      }
      this.ramos = this.authService.ramos;
      this.obtenerFotoPerfil();
    }

    ngOnDestroy() {
      if (this.intervalo) { 
        clearInterval(this.intervalo); 
      } 
    }

    obtenerMensajeAleatorio() { 
      const indiceAleatorio = Math.floor(Math.random() * this.mensajes.length); 
      this.mensajeActual = this.mensajes[indiceAleatorio]; 
    }

    
    cargarAsistenciasUsuario() {
      const asistenciasAlmacenadas: Asistencia[] = JSON.parse(localStorage.getItem('asistencias') || '[]');
      this.asistencia = asistenciasAlmacenadas.filter((asistencia: Asistencia) => asistencia.alumnoId === this.user.id);
      console.log('Asistencias cargadas para el usuario:', this.asistencia);
    }

    getCurrentTime() {
      const now = new Date();
      this.currentHour = now.getHours() - 1;
      this.currentMinutes = now.getMinutes();
      this.horaAsistencia = (this.currentHour * 100) + this.currentMinutes;
      console.log('Hora de asistencia:', this.horaAsistencia);
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
      const ahora = new Date();
      const diaActual = ahora.getDate();
      const mesActual = ahora.getMonth() + 1;
      const anioActual = ahora.getFullYear();
      
      let nombre_dia = '';
      const diaIndex = this.getDiaDeLaSemana();
      const dia_semana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
      nombre_dia = dia_semana[diaIndex];
    
      const clasesHoy = this.horario[nombre_dia];
      
      if (!clasesHoy || !Array.isArray(clasesHoy)) {
          console.error('Hoy no tienes clases:', nombre_dia);
          return;
      }
    
      let asistenciaRegistrada = false;
    
      for (const clase of clasesHoy) {
          for (const [moduloArray] of Object.entries(clase)) {
              if (Array.isArray(moduloArray)) {
                  for (const modulo of moduloArray) {
                      if (modulo.hora_inicio !== undefined && modulo.hora_fin !== undefined) {
                          const horaInicio = modulo.hora_inicio;
                          const horaFin = modulo.hora_fin;
                          
                          if (this.horaAsistencia >= horaInicio && this.horaAsistencia <= horaFin) {
                              const ramoId = modulo.ramo;
    
                              asistenciaRegistrada = await this.verificarAsistencia(ramoId, diaActual, mesActual, anioActual);
                              
                              if (asistenciaRegistrada) {
                                  this.presentAlert('Ya has registrado tu asistencia para este ramo hoy.');
                                  return;
                              } else {
                                  await this.registrarAsistenciaEnBaseDeDatos(ramoId, diaActual, mesActual, anioActual);
                                  this.presentAlert('Asistencia registrada con éxito.');
                                  return;
                              }
                          }
                      }
                  }
              }
          }
      }
    
      if (!asistenciaRegistrada) {
          this.presentAlert('No hay clases en el horario actual.');
      }
    }
     
    getRamoNombre(idRamo: number): string | null {
      for (let i = 0; i < this.ramos.length; i++) {
        if (Number(this.ramos[i].id) === Number(idRamo)) {
          return this.ramos[i].nombre;
        }
      }
      return null;
    }
    
  async verificarAsistencia(ramoId: string, dia: number, mes: number, anio: number): Promise<boolean> {
    const asistenciasAlmacenadas: Asistencia[] = JSON.parse(localStorage.getItem('asistencias') || '[]');
    
    const asistenciasAlumno = asistenciasAlmacenadas.filter((asistencia: Asistencia) => asistencia.alumnoId === this.user.id);
  
    const asistenciaExistente = asistenciasAlumno.find((asistencia: Asistencia) => {
      const fechaAsistencia = new Date(asistencia.fecha);
      return (
        asistencia.ramoId === ramoId &&
        fechaAsistencia.getDate() === dia &&
        fechaAsistencia.getMonth() + 1 === mes &&
        fechaAsistencia.getFullYear() === anio
      );
    });
  
    return asistenciaExistente ? true : false;
  }

  async registrarAsistenciaEnBaseDeDatos(asignatura: string, dia: number, mes: number, anio: number) {
    const idAsistencia = this.generarId();
    const alumnoId = this.user.id;

    const nuevaAsistencia: Asistencia = {
        id: idAsistencia,
        alumnoId: alumnoId,
        ramoId: asignatura,
        fecha: new Date(anio, mes - 1, dia),
    };

    const asistenciasAlmacenadas: Asistencia[] = JSON.parse(localStorage.getItem('asistencias') || '[]');
    asistenciasAlmacenadas.push(nuevaAsistencia);

    localStorage.setItem('asistencias', JSON.stringify(asistenciasAlmacenadas));
    console.log('Asistencia registrada:', nuevaAsistencia);
}


    generarId(): string {
      return Math.random().toString(36).substr(2, 9);
    }

    getDiaDeLaSemana() {
      const now = new Date();
      return now.getDay();
    }

    async scan(): Promise<void> {
      try {
          const isSupported = await BarcodeScanner.isSupported();
          if (!isSupported.supported) {
              console.error('Barcode scanner no es compatible en este dispositivo.');
              return;
          }
  
          const permissions = await BarcodeScanner.requestPermissions();
          if (permissions.camera !== 'granted' && permissions.camera !== 'limited') {
              console.error('Permisos de cámara no concedidos.');
              return;
          }
  
          const { barcodes } = await BarcodeScanner.scan();
          if (!barcodes.length) {
              console.error('No se detectaron códigos QR.');
              return;
          }
  
          // Asumimos que tomamos el primer QR válido
          const qrData = barcodes[0].rawValue;
  
          // Validar y procesar el QR
          const validData = this.validarQR(qrData);
          if (!validData) {
              await this.presentAlert('Formato de QR inválido.');
              return;
          }
  
          const { asignatura, fecha } = validData;
  
          // Verificar si la clase actual corresponde al QR escaneado
          const [anio, mes, dia] = [
              parseInt(fecha.substring(0, 4), 10),
              parseInt(fecha.substring(4, 6), 10),
              parseInt(fecha.substring(6, 8), 10),
          ];
          const diaIndex = this.getDiaDeLaSemana();
          const dia_semana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
          const nombre_dia = dia_semana[diaIndex];
  
          const clasesHoy = this.horario[nombre_dia];
          if (!clasesHoy || !Array.isArray(clasesHoy)) {
              await this.presentAlert('No tienes clases asignadas para hoy.');
              return;
          }
  
          let claseValida = false;
          this.presentAlert("Asignatura: " + asignatura);
          for (const clase of clasesHoy) {
              if (clase.modulo1 && Array.isArray(clase.modulo1)) {
                  for (const modulo of clase.modulo1) {  
                    if (
                          modulo.ramo === asignatura &&
                          modulo.hora_inicio <= this.horaAsistencia &&
                          modulo.hora_fin >= this.horaAsistencia
                      ) {
                          claseValida = true;
                          break;
                      }
                  }
              }
              if (claseValida) break;
          }
  
          if (!claseValida) {
              await this.presentAlert('La clase escaneada no corresponde a tu horario actual.');
              return;
          }
  
          // Registrar la asistencia en la base de datos
          const asistenciaYaRegistrada = await this.verificarAsistencia(asignatura, dia, mes, anio);
  
          if (asistenciaYaRegistrada) {
              await this.presentAlert('Ya has registrado tu asistencia para esta clase hoy.');
              return;
          }
  
          await this.registrarAsistenciaEnBaseDeDatos(asignatura, dia, mes, anio);
          await this.presentAlert('Asistencia registrada correctamente.');
      } catch (error) {
          console.error('Error durante el escaneo:', error);
          await this.presentAlert('Error durante el proceso de escaneo.');
          throw error;
      }
  }
  
  
  //modificar para el qr del profe
  private validarQR(data: string): { asignatura: string; fecha: string } | null {
    const regex = /^([A-Z0-9]+)\|(\d{8})$/;
    const match = data.match(regex);
    this.presentAlert("Valor de match: "+ match + ", Valor de regex");
    if (!match) {
        return null;
    }
    return {
        asignatura: match[1],
        fecha: match[2],
    };
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

        if (
          latitud >= -33.599638 && latitud <= -33.403638 &&
          longitud >= -70.766109 && longitud <= -70.548109
        ) {
          console.log(this.horaAsistencia);
          await this.registrarAsistencia();
        } else {
          message = 'No estás en Duoc.';
        }

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

    abrirVivoDuoc() {
      window.open('vivoduoc://', '_system');
    }

    // Método para abrir Gmail
    abrirGmail() {
      window.open('googlegmail://', '_system');
    }

    // Método para abrir Google
    abrirGoogle() {
      window.open('http://www.google.com', '_system');
    }
}

  
