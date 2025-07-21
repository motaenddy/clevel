# 🎯 Especificaciones: Seguimiento de Pagos de Clientes

## 📋 Descripción del Problema

Como CEO, necesitas tener visibilidad completa y en tiempo real del estado de los pagos de tus clientes para:

- Identificar pagos vencidos rápidamente
- Tomar decisiones informadas sobre el flujo de caja
- Priorizar acciones de cobranza
- Mantener un historial organizado de transacciones

## 🎯 Requerimientos Específicos (Basados en tu Excel)

### Métricas Críticas (KPIs Principales)

1. **Total Facturado**: Suma de todas las facturaciones a clientes
2. **Total Pagado**: Suma de todos los pagos realizados
3. **Porcentaje Logrado**: (Total pagado / Total facturado) \* 100

### Flujo de Trabajo

- **Revisión semanal** de la información
- **Acción inmediata** cuando clientes están en retraso (escribir/enviar email)
- **Fecha de compromiso** = acuerdo de pago con el centro
- **Pagos mensuales** (modelo SAAS)
- **Solo acceso del CEO** por el momento

### Alertas Visuales

- **Rojo**: Clientes con cuotas vencidas (pasaron del tiempo establecido)
- **Amarillo**: "Sin fecha" en días restantes
- **Valores #NUM!**: Errores de fórmula (no implementar)

### Filtros Necesarios

- **Por centro/cliente** individual
- **Por estado de pago**
- **Por cuotas vencidas**

## 🎨 Funcionalidades Core

### 1. Dashboard de Pagos

- **KPIs principales** (métricas críticas):
  - **Total facturado**: Suma de todas las facturaciones
  - **Total pagado**: Suma de todos los pagos realizados
  - **Porcentaje logrado**: (Total pagado / Total facturado) \* 100
- **Resumen por centro**: Filtrado individual por cada cliente/centro
- **Alertas visuales**: Clientes con cuotas vencidas (destacados en rojo)
- **Vista general**: Lista de todos los clientes con estado actual

### 2. Lista de Clientes

- **Vista de tabla** con columnas (basada en tu Excel):
  - Nombre del cliente/centro
  - Monto facturado (RD$)
  - Monto pagado (RD$)
  - Fecha último pago
  - Fecha última cuota
  - Cuotas vencidas (con alerta roja si > 0)
  - Fecha de compromiso
  - Días restantes
- **Filtros rápidos**:
  - Por cliente/centro (búsqueda)
  - Por estado de pago
  - Por cuotas vencidas
- **Resaltado visual**: Clientes con cuotas vencidas en rojo

### 3. Detalle de Cliente

- **Información del cliente**:
  - Datos de contacto
  - Historial de pagos
  - Notas importantes
- **Lista de facturas**:
  - Número de factura
  - Fecha de emisión
  - Fecha de vencimiento
  - Monto
  - Estado
- **Acciones rápidas**:
  - Marcar como pagado
  - Enviar recordatorio
  - Agregar nota

### 4. Alertas y Notificaciones

- **Notificaciones push** para:
  - Pagos vencidos
  - Pagos próximos a vencer (3 días antes)
  - Pagos recibidos
- **Indicadores visuales**:
  - Badges con número de alertas
  - Colores por prioridad (rojo=vencido, amarillo=próximo)

## 📊 Modelo de Datos

### Cliente

```javascript
{
  id: string,
  nombre: string,
  email: string,
  telefono: string,
  direccion: string,
  fechaCreacion: Date,
  notas: string,
  estado: 'activo' | 'inactivo'
}
```

### Cliente/Centro

```javascript
{
  id: string,
  nombre: string,
  montoFacturado: number,
  montoPagado: number,
  fechaUltimoPago: Date | null,
  fechaUltimaCuota: Date,
  cuotasVencidas: number,
  fechaCompromiso: Date | null,
  diasRestantes: number | null,
  estado: 'al_dia' | 'vencido' | 'compromiso',
  notas: string
}
```

## 🎨 Diseño de Interfaz

### Pantalla Principal (Dashboard)

- **Header**: Título + Botón de agregar cliente
- **Cards de resumen**: 3-4 métricas principales
- **Gráfico**: Tendencia de pagos (últimos 30 días)
- **Lista de alertas**: Pagos vencidos y próximos a vencer
- **FAB**: Botón flotante para agregar factura

### Lista de Clientes

- **Search bar**: Búsqueda por nombre
- **Filtros**: Chips para filtrar por estado
- **Lista**: Cards con información resumida
- **Pull to refresh**: Actualizar datos

### Detalle de Cliente

- **Header**: Foto/avatar + nombre + estado
- **Tabs**: Información / Facturas / Notas
- **Acciones**: Botones de acción rápida

## 🔧 Funcionalidades Técnicas

### LocalStorage Structure

```javascript
// Claves de almacenamiento
"ceo-app-clients"; // Array de clientes/centros
"ceo-app-settings"; // Configuraciones de la app
"ceo-app-summary"; // Resumen de KPIs calculados
```

### Servicios Necesarios

- `ClientService`: CRUD de clientes/centros
- `SummaryService`: Cálculo de KPIs (totales y porcentajes)
- `StorageService`: Persistencia en LocalStorage
- `FilterService`: Filtrado y búsqueda de clientes

### Componentes Vue

- `PaymentDashboard.vue` - Dashboard principal con KPIs
- `ClientList.vue` - Lista de clientes con filtros
- `ClientDetail.vue` - Detalle de cliente individual
- `ClientForm.vue` - Formulario para agregar/editar clientes
- `ClientCard.vue` - Tarjeta de cliente individual
- `KPICard.vue` - Tarjeta de métrica (Total facturado, pagado, %)
- `FilterBar.vue` - Barra de filtros y búsqueda

## 📱 Navegación

```
Dashboard (Tab 1)
├── Lista de Clientes
│   └── Detalle de Cliente
│       ├── Información
│       ├── Facturas
│       └── Notas
└── Agregar Cliente

Pagos (Tab 2)
├── Lista de Pagos
├── Agregar Pago
└── Reportes

Configuración (Tab 3)
└── Ajustes de notificaciones
```

## 🚀 Próximos Pasos

### ✅ Completado

1. **Setup del proyecto** Ionic + Vue
2. **Crear estructura de carpetas** y componentes base
3. **Desarrollar Dashboard** con KPIs principales

### 🔄 En Progreso - Sección Clientes

4. **Crear página de Clientes** con lista y gestión
5. **Implementar formulario** para agregar/editar clientes
6. **Crear sistema de facturación mensual** por cliente
7. **Implementar servicios** de LocalStorage para persistencia
8. **Conectar datos** con el Dashboard (KPIs dinámicos)
9. **Implementar filtros** y búsqueda de clientes
10. **Agregar validaciones** y mejoras de UX

---

_Documento de especificaciones para la funcionalidad prioritaria_
