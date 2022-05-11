import { Component, OnInit, Inject } from '@angular/core';
import { ColorThemeService } from 'src/app/services/color-theme.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/api/producto/producto.service';
import { ILamina } from 'src/app/models/ILamina';
import { LaminaService } from 'src/app/api/lamina/lamina.service';
import { from, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { IProducto } from 'src/app/models/IProducto';

@Component({
    selector: 'app-editar-producto',
    templateUrl: './editar-producto.component.html',
    styleUrls: ['./editar-producto.component.css']
})

export class EditarProductoComponent implements OnInit {

    public color = 'primary';
    public actualTheme: string;
    public dark = 'dark';
    public light = 'light';
    public colorMode: string;

    public editarProductoFormGroup: FormGroup;

    public LAMINAS: ILamina[];

    constructor(
        public dialogRef: MatDialogRef<EditarProductoComponent>,
        public dialog: MatDialog,
        public colorThemeService: ColorThemeService,
        private _formBuilder: FormBuilder,
        private laminaService: LaminaService,
        public snackBarService: SnackBarService,
        private productoService: ProductoService,
        @Inject(MAT_DIALOG_DATA) public producto: IProducto,
    ) {
        this.actualizarDatos();
        this.colorThemeService.theme.subscribe((theme) => {
            this.actualTheme = theme;
            this.viewColor();
        });
    }

    actualizarDatos() {
        this.laminaService.obtenerLaminasGet().subscribe(laminas => {
            this.LAMINAS = laminas;
            console.log(this.LAMINAS);
        });
    }

    viewColor() {
        if (this.actualTheme.includes(this.dark)) {
            this.colorMode = this.dark;
        }
        if (this.actualTheme.includes(this.light)) {
            this.colorMode = this.light;
        }
        console.log(this.colorMode);
    }

    ngOnInit() {
        this.editarProductoFormGroup = this._formBuilder.group({
            nombreCtrl: [this.producto.nombre, Validators.required],
            tipoCtrl: [this.producto.tipo, Validators.required],
            precioCtrl: [this.producto.precio, Validators.required],
        });
    }

    cancelar() {
        this.dialogRef.close({
            res: false
        });
    }

    editarUsuario() {
        if(!this.editarProductoFormGroup.controls['nombreCtrl'].hasError('required') && !this.editarProductoFormGroup.controls['tipoCtrl'].hasError('required')
            && !this.editarProductoFormGroup.controls['precioCtrl'].hasError('required')) {
        
            this.producto.nombre = this.editarProductoFormGroup.controls['nombreCtrl'].value;
            this.producto.precio = this.editarProductoFormGroup.controls['precioCtrl'].value;
            let lam = this.LAMINAS.find(lami => lami.nombre === this.editarProductoFormGroup.controls['tipoCtrl'].value);
            this.producto.tipo = lam.nombre;
            
            this.snackBarService.greenSnackBar('Producto editado con éxito');
            this.productoService.editarProductoPut(this.producto).subscribe(res => {
                this.dialogRef.close({
                    res: true
                });
             });
        }

        else {
            this.snackBarService.redSnackBar('Favor de llenar todos los campos');
        }
    }
}