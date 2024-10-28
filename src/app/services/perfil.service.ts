import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private apiUrl = 'https://randomuser.me/api/';

  constructor() { }

  async obtenerFotoPerfil(): Promise<string> {
    try {
      const response = await axios.get(this.apiUrl);
      const fotoPerfil = response.data.results[0].picture.large;
      return fotoPerfil;
    } catch (error) {
      console.error('Error al obtener la foto de perfil', error);
      return '';
    }
  }
}
