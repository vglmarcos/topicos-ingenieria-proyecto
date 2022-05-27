import { IDireccion } from './IDireccion'

export interface ICliente {
    _id?: number,
    id?: number,
    nombre: string,
    telefono: string,
    correo: string,
    direccion: IDireccion,
    createdAt?: Date,
    updatedAt?: Date
}