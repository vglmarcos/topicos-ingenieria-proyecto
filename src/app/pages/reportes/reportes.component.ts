import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CotizacionService } from 'src/app/api/cotizacion/cotizacion.service';
import { ProductoService } from 'src/app/api/producto/producto.service';
import { VentaService } from 'src/app/api/venta/venta.service';
import { IVenta } from 'src/app/models/IVenta';
import { ColorThemeService } from 'src/app/services/color-theme.service';

export interface tablaProductosReporte {
    id: number,
    nombre_producto: string,
    cantidad: string
}

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css'],
    providers: [
        { provide: MatPaginatorIntl, useValue: CustomPaginator() }  // Here
    ]
})

export class ReportesComponent {
    color = 'primary';
    public actualTheme: string;
    dark = 'dark';
    light = 'light';
    public colorMode: string;
    displayedColumns: string[] = ['id', 'nombre', 'cantidad'];
    dataSource: MatTableDataSource<tablaProductosReporte>;
    VENTAS: Array<IVenta>;
    private datosTabla: tablaProductosReporte[] = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    constructor(public colorThemeService: ColorThemeService, private ventaService: VentaService, private cotizacionService: CotizacionService, private productoService: ProductoService) {
        this.colorThemeService.theme.subscribe((theme) => {
            this.actualTheme = theme;
            this.viewColor();
        });
        this.iniciarDatos();
    }

    iniciarDatos() {
        this.ventaService.obtenerVentasGet().subscribe(ventas => {
            this.cotizacionService.obtenerCotizacionesGet
            this.VENTAS = ventas;
            this.datosTabla = [];
        
              this.dataSource = new MatTableDataSource(this.datosTabla);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
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