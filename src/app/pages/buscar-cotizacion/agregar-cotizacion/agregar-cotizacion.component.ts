import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ColorThemeService } from 'src/app/services/color-theme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { IProducto } from 'src/app/models/IProducto';
import { ProductoService } from 'src/app/api/producto/producto.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ICliente } from 'src/app/models/ICliente';
import { ICotizacion } from 'src/app/models/ICotizacion';
import { ICarrito } from 'src/app/models/ICarrito';
import { ClienteService } from 'src/app/api/cliente/cliente.service';
import { CotizacionService } from 'src/app/api/cotizacion/cotizacion.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ConfirmarEliminarComponent } from 'src/app/shared/confirmar-eliminar/confirmar-eliminar.component';
import { MatDialog } from '@angular/material/dialog';
import { VentaService } from 'src/app/api/venta/venta.service';
import { IVenta } from 'src/app/models/IVenta';
import { LaminaService } from 'src/app/api/lamina/lamina.service';
import { ILamina } from 'src/app/models/ILamina';

export interface item {
    id_producto: number,
    nombre: string,
    tipo: string,
    dimensiones: {
        largo: number,
        ancho: number
    },
    cantidad: number,
    precio_unitario: number,
    total: number
}

@Component({
    selector: 'app-agregar-cotizacion',
    templateUrl: './agregar-cotizacion.component.html',
    styleUrls: ['./agregar-cotizacion.component.css'],
    providers: [
        { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
        { provide: MatPaginatorIntl, useValue: CustomPaginator() }
    ]
})

export class AgregarCotizacionComponent implements OnInit {

    color = 'primary';
    public actualTheme: string;
    dark = 'dark';
    light = 'light';
    public colorMode: string;

    public filteredOptions: Observable<IProducto[]>;
    // public filteredOptionsClientes: Observable<ICliente[]>

    public PRODUCTOS: IProducto[];
    public CLIENTES: ICliente[];
    public LAMINAS: ILamina[];

    public checked: boolean = false;

    public firstFormGroup: FormGroup;
    public secondFormGroup: FormGroup;

    public cliente: ICliente = {
        nombre: '',
        telefono: '',
        correo: '',
        direccion: {
            calle: "",
            ciudad: "",
            cod_postal: "",
            colonia: "",
            numero: ""
        }
    };
    public cotizacion: ICotizacion = {
        id_usuario: 0,
        id_cliente: 0,
        carrito: [],
        subtotal: 0,
        total: 0,
        estado: '',
    };

    public productosCarrito: item[] = [];
    public dataSource: MatTableDataSource<item> = new MatTableDataSource<item>();

    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns: string[] = [
        'nombre', 'tipo', 'dimensiones', 'cantidad', 'precio_unitario', 'total', 'eliminar'
    ];

    constructor(
        public dialogRef: MatDialogRef<AgregarCotizacionComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: string,
        public colorThemeService: ColorThemeService,
        private _formBuilder: FormBuilder,
        private productoService: ProductoService,
        private clienteService: ClienteService,
        private cotizacionService: CotizacionService,
        public snackBarService: SnackBarService,
        private ventaService: VentaService,
        private laminaService: LaminaService,
        private cdr: ChangeDetectorRef
    ) {
        this.actualizarDatos();
        this.colorThemeService.theme.subscribe((theme) => {
            this.actualTheme = theme;
            this.viewColor();
        });
    }

    actualizarDatos() {
        this.productoService.obtenerProductosGet().subscribe(productos => {
            this.PRODUCTOS = productos;
            this.filteredOptions = this.secondFormGroup.controls['nombreCtrl'].valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value))
                );
        });
        this.laminaService.obtenerLaminasGet().subscribe(laminas => {
            this.LAMINAS = laminas;
        });
    }

    viewColor() {
        if (this.actualTheme.includes(this.dark)) {
            this.colorMode = this.dark;
        }
        if (this.actualTheme.includes(this.light)) {
            this.colorMode = this.light;
        }
    }

    ngOnInit() {
        this.firstFormGroup = this._formBuilder.group({
            nombreCtrl: ['', Validators.required],
            correoCtrl: ['', [Validators.required, Validators.email]],
            telCtrl: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]*')]],
            calleCtrl: ['', Validators.required],
            numeroCtrl: ['', Validators.required],
            coloniaCtrl: ['', Validators.required],
            cpCtrl: ['', Validators.required],
            ciudadCtrl: ['', Validators.required]
        });
        this.secondFormGroup = this._formBuilder.group({
            nombreCtrl: [''],
            anchoCtrl: [''],
            largoCtrl: [''],
            precioCtrl: ['0'],
            cantidadCtrl: [''],
            totalCtrl: ['0'],
        });
    }

    private _filter(nombre: string): IProducto[] {
        const filterValue = nombre.toLowerCase();

        return this.PRODUCTOS.filter(producto => producto.nombre.toLowerCase().includes(filterValue));
    }

    // private _filterC(nombre: string): ICliente[] {
    //     const filterValueC = nombre.toLowerCase();

    //     return this.CLIENTES.filter(cliente => cliente.nombre.toLowerCase().includes(filterValueC));
    // }

    ngAfterViewInit() {
        let ancho;
        let largo;
        let precio;
        let cantidad;
        let total;

        this.dataSource.paginator = this.paginator;

        this.secondFormGroup.controls['nombreCtrl'].valueChanges.subscribe((value) => {
            let producto = this.findProductoByNombre(value);
            if (producto) {
                this.secondFormGroup.controls['precioCtrl'].setValue(producto.precio);
            } else {
                this.secondFormGroup.controls['precioCtrl'].setValue('');
            }
        });

        this.secondFormGroup.controls['anchoCtrl'].valueChanges.subscribe((value) => {
            if (value) {
                try {
                    ancho = parseFloat(value);
                    if (ancho && largo && cantidad && precio) {
                        total = ancho * largo * cantidad * precio;
                        this.secondFormGroup.controls['totalCtrl'].setValue(total);
                    } else {
                        this.secondFormGroup.controls['totalCtrl'].setValue('0');
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                ancho = value;
                this.secondFormGroup.controls['totalCtrl'].setValue('0');
            }
        });

        this.secondFormGroup.controls['largoCtrl'].valueChanges.subscribe((value) => {
            if (value) {
                try {
                    largo = parseFloat(value);
                    if (ancho && largo && cantidad && precio) {
                        total = ancho * largo * cantidad * precio;
                        this.secondFormGroup.controls['totalCtrl'].setValue(total);
                    } else {
                        this.secondFormGroup.controls['totalCtrl'].setValue('0');
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                largo = value;
                this.secondFormGroup.controls['totalCtrl'].setValue('0');
            }
        });

        this.secondFormGroup.controls['precioCtrl'].valueChanges.subscribe((value) => {
            if (value) {
                try {
                    precio = parseFloat(value);
                    if (ancho && largo && cantidad && precio) {
                        total = ancho * largo * cantidad * precio;
                        this.secondFormGroup.controls['totalCtrl'].setValue(total);
                    } else {
                        this.secondFormGroup.controls['totalCtrl'].setValue('0');
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                precio = value;
                this.secondFormGroup.controls['totalCtrl'].setValue('0');
            }
        });

        this.secondFormGroup.controls['cantidadCtrl'].valueChanges.subscribe((value) => {
            if (value) {
                try {
                    cantidad = parseInt(value);
                    if (ancho && largo && cantidad && precio) {
                        total = ancho * largo * cantidad * precio;
                        this.secondFormGroup.controls['totalCtrl'].setValue(total);
                    } else {
                        this.secondFormGroup.controls['totalCtrl'].setValue('0');
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                cantidad = value;
                this.secondFormGroup.controls['totalCtrl'].setValue('0');
            }
        });
    }

    onSelectionChange(event) {
        switch(event.selectedIndex) {
            case 1:
                this.iniciarCliente();
                break;
            case 2:
                this.iniciarCotizacion();
                break;
            default:
                break;
        }
    }

    numberOnly(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;

    }

    cancelar() {
        this.dialogRef.close({
            res: "ok"
        });
    }

    findProductoByNombre(nombre: string): IProducto {
        return this.PRODUCTOS.find(producto => producto.nombre === nombre);
    }

    addCarrito() {
        let nombre = this.secondFormGroup.controls['nombreCtrl'].value;
        let producto = this.findProductoByNombre(nombre);
        if (producto) {
            let anchoVacio = this.secondFormGroup.controls['anchoCtrl'].value === '' || this.secondFormGroup.controls['anchoCtrl'].value === null;
            let largoVacio = this.secondFormGroup.controls['largoCtrl'].value === '' || this.secondFormGroup.controls['largoCtrl'].value === null;
            let cantidadVacia = this.secondFormGroup.controls['cantidadCtrl'].value === '' || this.secondFormGroup.controls['cantidadCtrl'].value === null;
            if (!anchoVacio && !largoVacio && !cantidadVacia) {
                if (parseFloat(this.secondFormGroup.controls['anchoCtrl'].value) > 0.0) {
                    if (parseFloat(this.secondFormGroup.controls['largoCtrl'].value) > 0.0) {
                        if (parseInt(this.secondFormGroup.controls['cantidadCtrl'].value) > 0.0) {
                            let item: item = {
                                id_producto: producto.id,
                                nombre: producto.nombre,
                                tipo: producto.tipo,
                                dimensiones: {
                                    largo: parseFloat(this.secondFormGroup.controls['largoCtrl'].value),
                                    ancho: parseFloat(this.secondFormGroup.controls['anchoCtrl'].value)
                                },
                                cantidad: parseInt(this.secondFormGroup.controls['cantidadCtrl'].value),
                                precio_unitario: producto.precio,
                                total: parseFloat(this.secondFormGroup.controls['totalCtrl'].value)
                            }
                            this.PRODUCTOS.forEach(producto => {
                                if (item.nombre === producto.nombre) {
                                    console.log(item.cantidad);
                                    console.log(this.LAMINAS.find(lamina => lamina.nombre === producto.tipo).cantidad);
                                    if (item.cantidad > this.LAMINAS.find(lamina => lamina.nombre === producto.tipo).cantidad) {
                                        this.snackBarService.redSnackBar(`El producto sobrepasa la cantidad en existencias, actualmente existen ${this.LAMINAS.find(lamina => lamina.nombre === producto.tipo).cantidad} ${item.nombre}.`);
                                    } else {
                                        this.productosCarrito.push(item);
                                        this.dataSource.data = this.productosCarrito;
                                        this.snackBarService.greenSnackBar('Se ha agregado el producto a Carrito');
                                        this.resetCampos();
                                    }
                                }
                            });
                        } else {
                            this.snackBarService.redSnackBar('La cantidad debe ser mayor a cero');
                            console.log('la cantidad debe ser mayor a cero')
                        }
                    } else {
                        this.snackBarService.redSnackBar('El largo debe ser mayor a cero');
                        console.log('el largo debe ser mayor a cero')
                    }
                } else {
                    this.snackBarService.redSnackBar('El ancho debe ser mayor a cero');
                    console.log('el ancho debe ser mayor a cero')
                }
            } else {
                this.snackBarService.redSnackBar("Se deben llenar todos los datos");
                console.log('se deben llenar todos los datos');
            }
        } else {
            this.snackBarService.redSnackBar("Favor de ingresar producto válido");
            console.log('ingresar producto valido')
        }
        this.cdr.markForCheck();
    }

    resetCampos() {
        this.secondFormGroup.controls['nombreCtrl'].setValue('');
        this.secondFormGroup.controls['anchoCtrl'].setValue('');
        this.secondFormGroup.controls['largoCtrl'].setValue('');
        this.secondFormGroup.controls['precioCtrl'].setValue('0');
        this.secondFormGroup.controls['cantidadCtrl'].setValue('');
        this.secondFormGroup.controls['totalCtrl'].setValue('0');
    }

    deleteItem(index: number) {
        const dialogRef = this.dialog.open(ConfirmarEliminarComponent, {
            data: 'Producto del Carrito',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result.res) {
                console.log(index);
                this.snackBarService.greenSnackBar('Se ha eliminado el producto de carrito');
                this.productosCarrito.splice(index, 1);
                this.dataSource.data = this.productosCarrito;
                this.cdr.markForCheck();
            } else {
                this.snackBarService.redSnackBar('Eliminación cancelada');
                console.log(`Exit on click outside`);
            }
        });
    }

    iniciarCotizacion() {
        if (this.productosCarrito.length === 0) {
            console.log("se debe agregar al menos un producto al carrito");
            this.secondFormGroup.setErrors(Validators.required);
        } else {
            let items: ICarrito[] = [];
            for (let i = 0; i < this.productosCarrito.length; i++) {
                items.push({
                    id_producto: this.findProductoByNombre(this.productosCarrito[i].nombre).id,
                    dimensiones: {
                        largo: this.productosCarrito[i].dimensiones.largo,
                        ancho: this.productosCarrito[i].dimensiones.ancho
                    },
                    cantidad: this.productosCarrito[i].cantidad,
                    subtotal: this.productosCarrito[i].total
                });
            }
            this.clienteService.agregarClientePost(this.cliente).subscribe(res => {
                let total = 0;
                items.forEach(item => {
                    total += item.subtotal
                });
                this.cotizacion = {
                    id_usuario: 1,
                    id_cliente: res.id,
                    carrito: items,
                    subtotal: total,
                    total: total + (total * .16),
                    estado: 'Pendiente'
                }
            });
        }
    }

    iniciarCliente() {
        this.cliente = {
            nombre: this.firstFormGroup.controls['nombreCtrl'].value,
            telefono: this.firstFormGroup.controls['telCtrl'].value,
            correo: this.firstFormGroup.controls['correoCtrl'].value,
            direccion: {
                calle: this.firstFormGroup.controls['calleCtrl'].value,
                ciudad: this.firstFormGroup.controls['ciudadCtrl'].value,
                cod_postal: this.firstFormGroup.controls['cpCtrl'].value,
                colonia: this.firstFormGroup.controls['coloniaCtrl'].value,
                numero: this.firstFormGroup.controls['numeroCtrl'].value,
            },
        }
    }

    guardarCotizacion() {
        this.cotizacion.estado = this.checked ? 'Completada' : 'Pendiente';
        if (this.cotizacion.estado == 'Completada') {
            this.cotizacionService.agregarCotizacionPost(this.cotizacion).subscribe(res => {
                let venta: IVenta = {
                    estado: 'En Curso',
                    id_cotizacion: res.id
                }
                this.ventaService.agregarVentaPost(venta).subscribe(res => {
                    console.log('Venta guardada con exito', res)
                });
                this.snackBarService.greenSnackBar('Cotizacion guardada con éxito');
                this.dialogRef.close({
                    res: "realizada"
                });
            });
        } else {
            this.cotizacionService.agregarCotizacionPost(this.cotizacion).subscribe(_ => {
                this.snackBarService.greenSnackBar('Cotizacion guardada con éxito');
                this.dialogRef.close({
                    res: "realizada"
                });
            });
        }
    }
}

function CustomPaginator() {
    const customPaginatorIntl = new MatPaginatorIntl();
    customPaginatorIntl.itemsPerPageLabel = 'Registros por página:';
    customPaginatorIntl.previousPageLabel = 'Página anterior'
    customPaginatorIntl.nextPageLabel = 'Página siguiente';
    customPaginatorIntl.getRangeLabel = (page: number, size: number, length: number): string => {
        length = Math.max(length, 0);
        const startIndex = page * size;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ? Math.min(startIndex + size, length) : startIndex + page;
        return `${startIndex + 1} - ${endIndex} de ${length} registros`;
    };
    return customPaginatorIntl;
}