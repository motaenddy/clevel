# Documento de Requerimientos - Sistema Integral de Gestión CEO

## Introducción

El sistema integral de gestión CEO es una aplicación crítica que permitirá al usuario tener visibilidad completa y control sobre tres aspectos fundamentales del negocio: seguimiento de pagos de clientes, pipeline de negociación y pipeline de implementación. Esta funcionalidad aborda la necesidad de identificar pagos vencidos rápidamente, rastrear el progreso de negociaciones con prospectos, gestionar el proceso de implementación de sistemas en centros, y mantener un historial organizado de todas las transacciones y procesos. El sistema utilizará LocalStorage para el almacenamiento inicial como proof of concept, con estructura de datos preparada para migración futura a Firebase.

## Requerimientos

### Requerimiento 1

**Historia de Usuario:** Como CEO, quiero ver un dashboard con métricas clave de pagos para tener una visión general del estado financiero de mis clientes.

#### Criterios de Aceptación

1. CUANDO accedo al dashboard ENTONCES el sistema DEBERÁ mostrar el total facturado calculado como la suma de todas las facturaciones
2. CUANDO accedo al dashboard ENTONCES el sistema DEBERÁ mostrar el total pagado calculado como la suma de todos los pagos realizados
3. CUANDO acceso al dashboard ENTONCES el sistema DEBERÁ mostrar el porcentaje logrado calculado como (Total pagado / Total facturado) \* 100
4. CUANDO hay clientes con cuotas vencidas ENTONCES el sistema DEBERÁ mostrar una alerta visual destacada en rojo
5. CUANDO no hay datos disponibles ENTONCES el sistema DEBERÁ mostrar valores en cero y un mensaje informativo

### Requerimiento 2

**Historia de Usuario:** Como CEO, quiero gestionar la información de mis clientes para mantener un registro actualizado de sus datos de contacto y estado.

#### Criterios de Aceptación

1. CUANDO creo un nuevo cliente ENTONCES el sistema DEBERÁ permitir ingresar nombre, email, teléfono, dirección y notas
2. CUANDO creo un cliente ENTONCES el sistema DEBERÁ asignar automáticamente un ID único y fecha de creación
3. CUANDO edito un cliente existente ENTONCES el sistema DEBERÁ permitir modificar todos los campos excepto ID y fecha de creación
4. CUANDO elimino un cliente ENTONCES el sistema DEBERÁ solicitar confirmación antes de proceder
5. CUANDO guardo un cliente ENTONCES el sistema DEBERÁ validar que el nombre sea obligatorio y el email tenga formato válido

### Requerimiento 3

**Historia de Usuario:** Como CEO, quiero registrar la facturación mensual por cliente para llevar un control detallado de los montos facturados y pagados.

#### Criterios de Aceptación

1. CUANDO registro facturación mensual ENTONCES el sistema DEBERÁ permitir seleccionar el mes/año, monto facturado y fecha de vencimiento
2. CUANDO registro un pago ENTONCES el sistema DEBERÁ permitir ingresar el monto pagado y fecha del pago
3. CUANDO un pago está vencido ENTONCES el sistema DEBERÁ calcular automáticamente las cuotas vencidas
4. CUANDO establezco una fecha de compromiso ENTONCES el sistema DEBERÁ calcular los días restantes hasta esa fecha
5. CUANDO hay múltiples facturaciones para un cliente ENTONCES el sistema DEBERÁ mantener un historial completo por mes

### Requerimiento 4

**Historia de Usuario:** Como CEO, quiero ver una lista de todos mis clientes con su estado de pago para identificar rápidamente quiénes requieren seguimiento.

#### Criterios de Aceptación

1. CUANDO accedo a la lista de clientes ENTONCES el sistema DEBERÁ mostrar nombre, monto facturado, monto pagado, fecha último pago y cuotas vencidas
2. CUANDO un cliente tiene cuotas vencidas ENTONCES el sistema DEBERÁ resaltar la fila en color rojo
3. CUANDO busco un cliente por nombre ENTONCES el sistema DEBERÁ filtrar la lista en tiempo real
4. CUANDO filtro por estado de pago ENTONCES el sistema DEBERÁ mostrar solo los clientes que coincidan con el filtro seleccionado
5. CUANDO la lista está vacía ENTONCES el sistema DEBERÁ mostrar un mensaje indicando que no hay clientes registrados

### Requerimiento 5

**Historia de Usuario:** Como CEO, quiero ver el detalle completo de un cliente específico para revisar su historial de pagos y tomar acciones específicas.

#### Criterios de Aceptación

1. CUANDO selecciono un cliente ENTONCES el sistema DEBERÁ mostrar toda su información de contacto y estado actual
2. CUANDO veo el detalle ENTONCES el sistema DEBERÁ mostrar el historial completo de facturación mensual
3. CUANDO marco un pago como realizado ENTONCES el sistema DEBERÁ actualizar automáticamente los totales y el estado del cliente
4. CUANDO agrego una nota ENTONCES el sistema DEBERÁ guardar la nota con fecha y hora
5. CUANDO regreso a la lista ENTONCES el sistema DEBERÁ reflejar los cambios realizados en el detalle

### Requerimiento 6

**Historia de Usuario:** Como CEO, quiero recibir alertas visuales sobre pagos vencidos para poder tomar acciones de cobranza oportunas.

#### Criterios de Aceptación

1. CUANDO un cliente tiene cuotas vencidas ENTONCES el sistema DEBERÁ mostrar el número de cuotas vencidas en rojo
2. CUANDO un pago está próximo a vencer (3 días) ENTONCES el sistema DEBERÁ mostrar una alerta en amarillo
3. CUANDO hay pagos vencidos ENTONCES el sistema DEBERÁ mostrar un contador en el dashboard
4. CUANDO no hay fecha de compromiso establecida ENTONCES el sistema DEBERÁ mostrar "Sin fecha" en los días restantes
5. CUANDO se actualiza el estado de un pago ENTONCES el sistema DEBERÁ recalcular automáticamente todas las alertas

### Requerimiento 7

**Historia de Usuario:** Como CEO, quiero gestionar un pipeline de negociación para rastrear el progreso de prospectos desde el contacto inicial hasta el cierre de la venta.

#### Criterios de Aceptación

1. CUANDO accedo al pipeline de negociación ENTONCES el sistema DEBERÁ mostrar las fases: Prospecto, Presentación, Propuesta, Negociación, Cierre
2. CUANDO hago clic en una fase ENTONCES el sistema DEBERÁ mostrar todos los centros/prospectos en esa fase específica
3. CUANDO selecciono un prospecto ENTONCES el sistema DEBERÁ permitir moverlo entre fases del pipeline
4. CUANDO creo un nuevo prospecto ENTONCES el sistema DEBERÁ permitir asignarlo directamente a cualquier fase
5. CUANDO elimino un prospecto ENTONCES el sistema DEBERÁ solicitar confirmación antes de proceder

### Requerimiento 8

**Historia de Usuario:** Como CEO, quiero gestionar un pipeline de implementación separado para rastrear el progreso de centros desde entrenamientos hasta finalización.

#### Criterios de Aceptación

1. CUANDO accedo al pipeline de implementación ENTONCES el sistema DEBERÁ mostrar las fases: Entrenamientos, Implementación, Go-Live, Finalizada
2. CUANDO hago clic en una fase ENTONCES el sistema DEBERÁ mostrar todos los centros en esa fase específica
3. CUANDO selecciono un centro ENTONCES el sistema DEBERÁ permitir moverlo entre fases del pipeline
4. CUANDO un centro completa una fase ENTONCES el sistema DEBERÁ permitir avanzarlo a la siguiente fase
5. CUANDO un centro está en "Finalizada" ENTONCES el sistema DEBERÁ mantener su historial pero marcarlo como completado

### Requerimiento 9

**Historia de Usuario:** Como CEO, quiero gestionar subetapas dinámicas dentro de cada centro para llevar un control detallado tipo to-do list de las tareas específicas.

#### Criterios de Aceptación

1. CUANDO accedo al detalle de un centro ENTONCES el sistema DEBERÁ mostrar una lista de subetapas/tareas
2. CUANDO agrego una nueva subetapa ENTONCES el sistema DEBERÁ permitir definir: nombre, fecha de inicio, responsable, estado y comentario
3. CUANDO marco una subetapa como completada ENTONCES el sistema DEBERÁ actualizar visualmente su estado
4. CUANDO elimino una subetapa ENTONCES el sistema DEBERÁ solicitar confirmación antes de proceder
5. CUANDO edito una subetapa ENTONCES el sistema DEBERÁ permitir modificar todos sus campos

### Requerimiento 10

**Historia de Usuario:** Como CEO, quiero que las subetapas tengan estados claros para poder identificar rápidamente el progreso de cada tarea.

#### Criterios de Aceptación

1. CUANDO creo una subetapa ENTONCES el sistema DEBERÁ permitir asignar estados: Pendiente, En Progreso, Completada, Bloqueada
2. CUANDO una subetapa está "Bloqueada" ENTONCES el sistema DEBERÁ resaltarla visualmente en rojo
3. CUANDO una subetapa está "En Progreso" ENTONCES el sistema DEBERÁ mostrarla en amarillo
4. CUANDO una subetapa está "Completada" ENTONCES el sistema DEBERÁ mostrarla en verde
5. CUANDO cambio el estado de una subetapa ENTONCES el sistema DEBERÁ actualizar automáticamente la vista

### Requerimiento 11

**Historia de Usuario:** Como CEO, quiero que el dashboard mantenga su estructura actual mostrando las categorías del pipeline y permitiendo navegar a cada fase.

#### Criterios de Aceptación

1. CUANDO accedo al dashboard ENTONCES el sistema DEBERÁ mostrar las métricas de pagos y las categorías de pipeline
2. CUANDO hago clic en una categoría del pipeline ENTONCES el sistema DEBERÁ navegar a la vista de esa fase específica
3. CUANDO estoy en una fase del pipeline ENTONCES el sistema DEBERÁ mostrar el número de centros en esa fase
4. CUANDO regreso al dashboard ENTONCES el sistema DEBERÁ mantener los datos actualizados
5. CUANDO no hay centros en una fase ENTONCES el sistema DEBERÁ mostrar un mensaje informativo

### Requerimiento 12

**Historia de Usuario:** Como CEO, quiero que todos los datos se guarden localmente para poder trabajar sin conexión a internet durante la fase de proof of concept.

#### Criterios de Aceptación

1. CUANDO creo o modifico datos ENTONCES el sistema DEBERÁ guardar automáticamente en LocalStorage
2. CUANDO inicio la aplicación ENTONCES el sistema DEBERÁ cargar todos los datos desde LocalStorage
3. CUANDO no hay datos guardados ENTONCES el sistema DEBERÁ inicializar con estructuras vacías
4. CUANDO los datos se corrompen ENTONCES el sistema DEBERÁ mostrar un error y permitir reinicializar
5. CUANDO exporto datos ENTONCES el sistema DEBERÁ generar un archivo JSON con toda la información
