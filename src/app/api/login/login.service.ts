import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UsuarioService } from 'src/app/api/usuario/usuario.service';
import { IUsuario } from 'src/app/models/IUsuario';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private USUARIOS: IUsuario[];

  constructor(private usuarioService: UsuarioService) {

  }

  iniciarSesion(usuario: string, password: string) {
    this.usuarioService.obtenerUsuariosGet().subscribe(usuarios => {
      this.USUARIOS = usuarios;
    });
    if(this.USUARIOS) {
      const existeUsuario = this.USUARIOS.find(user => (user.usuario == usuario && user.contra == password));
      if(existeUsuario) return true;
    }
    return false;
  }
}