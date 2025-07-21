# 📋 Plan de Implementación: Sección Clientes

## 🎯 Objetivo

Crear una sección completa de gestión de clientes que permita:

- Ver lista de todos los clientes
- Agregar nuevos clientes
- Editar información de clientes existentes
- Gestionar facturación mensual por cliente
- Alimentar automáticamente el dashboard con datos reales

## 📊 Estructura de Datos

### Cliente (Cliente)

```javascript
{
  id: string,
  nombre: string,
  email: string,
  telefono: string,
  direccion: string,
  fechaCreacion: Date,
  estado: 'activo' | 'inactivo',
  notas: string
}
```

### Facturación Mensual (FacturacionMensual)

```javascript
{
  id: string,
  clienteId: string,
  mes: string, // "2024-01", "2024-02", etc.
  montoFacturado: number,
  montoPagado: number,
  fechaUltimoPago: Date | null,
  fechaVencimiento: Date,
  cuotasVencidas: number,
  fechaCompromiso: Date | null,
  estado: 'pendiente' | 'pagado' | 'vencido',
  notas: string
}
```

## 🎨 Diseño de Interfaz

### 1. Página Principal de Clientes

- **Header**: Título "Clientes" + Botón "Agregar Cliente"
- **Search bar**: Búsqueda por nombre de cliente
- **Filtros**: Por estado (activo/inactivo), por cuotas vencidas
- **Lista de clientes**: Cards con información resumida
- **Pull to refresh**: Actualizar datos

### 2. Card de Cliente

- **Nombre del cliente**
- **Estado** (activo/inactivo)
- **Monto pendiente total**
- **Cuotas vencidas** (con alerta roja si > 0)
- **Último pago**
- **Acciones**: Ver detalle, Editar, Agregar facturación

### 3. Detalle de Cliente

- **Información del cliente** (datos de contacto)
- **Historial de facturación** (tabla mensual)
- **Acciones rápidas**: Marcar como pagado, Agregar nota
- **Gráfico de tendencias** de pagos

### 4. Formulario de Cliente

- **Datos básicos**: Nombre, email, teléfono, dirección
- **Estado**: Activo/Inactivo
- **Notas**: Campo de texto libre

### 5. Formulario de Facturación Mensual

- **Mes**: Selector de mes/año
- **Monto facturado**: Input numérico
- **Fecha de vencimiento**: Date picker
- **Notas**: Campo opcional

## 🔧 Funcionalidades Técnicas

### Servicios Necesarios

1. **ClientService**

   - `getAllClients()`: Obtener todos los clientes
   - `getClientById(id)`: Obtener cliente específico
   - `createClient(client)`: Crear nuevo cliente
   - `updateClient(id, client)`: Actualizar cliente
   - `deleteClient(id)`: Eliminar cliente

2. **BillingService**

   - `getMonthlyBilling(clientId, month)`: Obtener facturación mensual
   - `createMonthlyBilling(billing)`: Crear facturación
   - `updateMonthlyBilling(id, billing)`: Actualizar facturación
   - `getOverdueClients()`: Obtener clientes vencidos
   - `calculateKPIs()`: Calcular KPIs para dashboard

3. **StorageService**
   - `saveClients(clients)`: Guardar en LocalStorage
   - `loadClients()`: Cargar desde LocalStorage
   - `saveBilling(billing)`: Guardar facturación
   - `loadBilling()`: Cargar facturación

### Componentes Vue

1. **ClientsPage.vue** - Página principal de clientes
2. **ClientList.vue** - Lista de clientes con filtros
3. **ClientCard.vue** - Tarjeta individual de cliente
4. **ClientDetail.vue** - Detalle completo del cliente
5. **ClientForm.vue** - Formulario para agregar/editar cliente
6. **BillingForm.vue** - Formulario para facturación mensual
7. **BillingHistory.vue** - Historial de facturación
8. **SearchFilter.vue** - Componente de búsqueda y filtros

## 📱 Navegación Actualizada

```
Dashboard (Tab 1)
├── KPIs principales
└── Clientes vencidos

Clientes (Tab 2) ← NUEVA SECCIÓN
├── Lista de Clientes
│   ├── Búsqueda y filtros
│   └── Agregar Cliente
├── Detalle de Cliente
│   ├── Información
│   ├── Historial de Facturación
│   └── Agregar Facturación Mensual
└── Formularios
    ├── Cliente
    └── Facturación

Configuración (Tab 3)
└── Ajustes
```

## 🔄 Flujo de Trabajo

### Para Agregar un Cliente:

1. Usuario hace clic en "Agregar Cliente"
2. Se abre formulario de cliente
3. Usuario llena datos básicos
4. Se guarda cliente en LocalStorage
5. Se actualiza lista de clientes

### Para Agregar Facturación Mensual:

1. Usuario selecciona cliente
2. Hace clic en "Agregar Facturación"
3. Se abre formulario de facturación
4. Usuario llena datos del mes
5. Se guarda facturación en LocalStorage
6. Se actualiza dashboard automáticamente

### Para Ver Dashboard:

1. Los KPIs se calculan automáticamente
2. Se suman todas las facturaciones
3. Se suman todos los pagos
4. Se calcula porcentaje logrado
5. Se identifican clientes vencidos

## 🚀 Pasos de Implementación

### Fase 1: Estructura Base

1. **Crear página ClientsPage.vue**
2. **Agregar ruta** en el router
3. **Actualizar menú lateral** con nueva sección
4. **Crear servicios base** (ClientService, BillingService, StorageService)

### Fase 2: Lista de Clientes

1. **Crear ClientList.vue** con búsqueda y filtros
2. **Crear ClientCard.vue** para mostrar cada cliente
3. **Implementar datos de ejemplo** basados en tu Excel
4. **Conectar con LocalStorage**

### Fase 3: Gestión de Clientes

1. **Crear ClientForm.vue** para agregar/editar
2. **Crear ClientDetail.vue** para ver detalle completo
3. **Implementar CRUD completo** de clientes

### Fase 4: Facturación Mensual

1. **Crear BillingForm.vue** para facturación mensual
2. **Crear BillingHistory.vue** para historial
3. **Conectar con dashboard** para KPIs dinámicos

### Fase 5: Integración y Mejoras

1. **Validaciones** en formularios
2. **Mejoras de UX** (loading states, confirmaciones)
3. **Testing** de funcionalidades
4. **Optimización** de rendimiento

## 📝 Notas Importantes

- **Datos de ejemplo**: Usar los datos de tu Excel como base
- **Validaciones**: Asegurar que los montos sean números positivos
- **Fechas**: Usar formato consistente (YYYY-MM-DD)
- **Estados**: Mantener estados sincronizados entre componentes
- **Performance**: Implementar paginación si hay muchos clientes

---

_Plan detallado para implementar la sección de Clientes_
