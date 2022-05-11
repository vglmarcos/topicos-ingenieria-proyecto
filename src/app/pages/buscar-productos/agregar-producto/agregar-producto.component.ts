import { Component, OnInit, Inject } from '@angular/core';
import { ColorThemeService } from 'src/app/services/color-theme.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProducto } from 'src/app/models/IProducto';
import { ILamina } from 'src/app/models/ILamina';
import { LaminaService } from 'src/app/api/lamina/lamina.service';
import { from, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProductoService } from 'src/app/api/producto/producto.service';

@Component({
    selector: 'app-agregar-producto',
    templateUrl: './agregar-producto.component.html',
    styleUrls: ['./agregar-producto.component.css']
})

export class AgregarProductoComponent implements OnInit {

    public color = 'primary';
    public actualTheme: string;
    public dark = 'dark';
    public light = 'light';
    public colorMode: string;

    public LAMINAS: ILamina[];

    public producto: IProducto = {
        nombre: '',
        tipo: '',
        precio: 0
    };

    public agregarProductoFormGroup: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<AgregarProductoComponent>,
        public dialog: MatDialog,
        public colorThemeService: ColorThemeService,
        private _formBuilder: FormBuilder,
        private laminaService: LaminaService,
        private productoService: ProductoService,
        public snackBarService: SnackBarService,
    ) {
        this.actualizarDatos();
        this.colorThemeService.theme.subscribe((theme) => {
            this.actualTheme = theme;
            this.viewColor();
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

    actualizarDatos() {
        this.laminaService.obtenerLaminasGet().subscribe(laminas => {
            this.LAMINAS = laminas;
            console.log(this.LAMINAS);
        });
    }

    ngOnInit() {
        this.agregarProductoFormGroup = this._formBuilder.group({
            nombreCtrl: ['', Validators.required],
            tipoCtrl: ['', Validators.required],
            precioCtrl: ['', Validators.required],
        });
    }

    cancelar() {
        this.dialogRef.close({
            res: false
        });
    }

    agregarProducto() {
        if (!this.agregarProductoFormGroup.controls['nombreCtrl'].hasError('required') && !this.agregarProductoFormGroup.controls['tipoCtrl'].hasError('required')
            && !this.agregarProductoFormGroup.controls['precioCtrl'].hasError('required')) {
            
            this.producto.nombre = this.agregarProductoFormGroup.controls['nombreCtrl'].value;
            this.producto.precio = this.agregarProductoFormGroup.controls['precioCtrl'].value;
            let lam = this.LAMINAS.find(lami => lami.nombre === this.agregarProductoFormGroup.controls['tipoCtrl'].value);
            this.producto.tipo = lam.nombre;

            this.productoService.agregarProductoPost(this.producto).subscribe(res => {
            });
            this.snackBarService.greenSnackBar('Producto agregado con éxito');
            this.dialogRef.close({
                res: true
            });
        }

        else {
            this.snackBarService.redSnackBar('Favor de llenar todos los campos');
            console.log(this.producto);
        }
    }
}