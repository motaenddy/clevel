<template>
  <div class="employee-form">
    <ion-list>
      <!-- Personal Information -->
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Información Personal</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label position="stacked">Nombre *</ion-label>
          <ion-input
            v-model="form.nombre"
            placeholder="Ingrese el nombre"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Apellido *</ion-label>
          <ion-input
            v-model="form.apellido"
            placeholder="Ingrese el apellido"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email *</ion-label>
          <ion-input
            v-model="form.email"
            type="email"
            placeholder="empleado@empresa.com"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Teléfono *</ion-label>
          <ion-input
            v-model="form.telefono"
            type="tel"
            placeholder="809-555-0101"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Fecha de Nacimiento</ion-label>
          <ion-input
            v-model="form.fechaNacimiento"
            type="date"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Documento de Identidad</ion-label>
          <ion-input
            v-model="form.documentoIdentidad"
            placeholder="402-1234567-8"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Dirección</ion-label>
          <ion-textarea
            v-model="form.direccion"
            placeholder="Ingrese la dirección completa"
            rows="2"
          ></ion-textarea>
        </ion-item>
      </ion-item-group>

      <!-- Work Information -->
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Información Laboral</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label position="stacked">Cargo *</ion-label>
          <ion-input
            v-model="form.cargo"
            placeholder="Ingrese el cargo"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Departamento *</ion-label>
          <ion-select
            v-model="form.departamento"
            placeholder="Seleccione el departamento"
            required
          >
            <ion-select-option
              v-for="dept in departments"
              :key="dept.id"
              :value="dept.nombre"
            >
              {{ dept.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Fecha de Contratación *</ion-label>
          <ion-input
            v-model="form.fechaContratacion"
            type="date"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Salario (RD$) *</ion-label>
          <ion-input
            v-model="form.salario"
            type="number"
            placeholder="50000"
            min="0"
            step="1000"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Estado *</ion-label>
          <ion-select
            v-model="form.estado"
            placeholder="Seleccione el estado"
            required
          >
            <ion-select-option value="activo">Activo</ion-select-option>
            <ion-select-option value="inactivo">Inactivo</ion-select-option>
            <ion-select-option value="vacaciones">Vacaciones</ion-select-option>
            <ion-select-option value="licencia">Licencia</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Supervisor</ion-label>
          <ion-select
            v-model="form.supervisor"
            placeholder="Seleccione supervisor (opcional)"
          >
            <ion-select-option value="">Sin supervisor</ion-select-option>
            <ion-select-option
              v-for="emp in employees"
              :key="emp.id"
              :value="emp.id"
            >
              {{ emp.nombre }} {{ emp.apellido }} - {{ emp.cargo }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-item-group>

      <!-- Skills and Projects -->
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Habilidades y Proyectos</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label position="stacked">Habilidades</ion-label>
          <ion-textarea
            v-model="habilidadesText"
            placeholder="Ingrese habilidades separadas por comas"
            rows="3"
            @ionInput="updateHabilidades"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Proyectos</ion-label>
          <ion-textarea
            v-model="proyectosText"
            placeholder="Ingrese proyectos separados por comas"
            rows="3"
            @ionInput="updateProyectos"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Notas</ion-label>
          <ion-textarea
            v-model="form.notas"
            placeholder="Información adicional sobre el empleado"
            rows="3"
          ></ion-textarea>
        </ion-item>
      </ion-item-group>
    </ion-list>

    <!-- Action Buttons -->
    <div class="form-actions">
      <ion-button
        expand="block"
        @click="saveEmployee"
        :disabled="!isFormValid"
      >
        {{ isEditing ? 'Actualizar' : 'Guardar' }} Empleado
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonItemGroup,
  IonItemDivider,
  IonButton,
} from "@ionic/vue";
import { ref, computed, onMounted, watch } from "vue";
import { useEmployeesStore } from "../stores/employees";
import type { Employee } from "../types/employee";

// Props
interface Props {
  employee?: Employee;
}

const props = withDefaults(defineProps<Props>(), {
  employee: undefined,
});

// Emits
const emit = defineEmits<{
  'employee-saved': [employee: Employee];
}>();

// Stores
const employeesStore = useEmployeesStore();

// Reactive data
const form = ref({
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  cargo: "",
  departamento: "",
  fechaContratacion: "",
  salario: 0,
  estado: "activo" as const,
  supervisor: "",
  direccion: "",
  documentoIdentidad: "",
  fechaNacimiento: "",
  notas: "",
  habilidades: [] as string[],
  proyectos: [] as string[],
});

const habilidadesText = ref("");
const proyectosText = ref("");

// Computed properties
const isEditing = computed(() => !!props.employee);
const employees = computed(() => employeesStore.employees);
const departments = computed(() => employeesStore.departments);

const isFormValid = computed(() => {
  return (
    form.value.nombre.trim() !== "" &&
    form.value.apellido.trim() !== "" &&
    form.value.email.trim() !== "" &&
    form.value.telefono.trim() !== "" &&
    form.value.cargo.trim() !== "" &&
    form.value.departamento.trim() !== "" &&
    form.value.fechaContratacion !== "" &&
    form.value.salario > 0
  );
});

// Methods
const updateHabilidades = () => {
  form.value.habilidades = habilidadesText.value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill !== "");
};

const updateProyectos = () => {
  form.value.proyectos = proyectosText.value
    .split(",")
    .map((project) => project.trim())
    .filter((project) => project !== "");
};

const saveEmployee = () => {
  if (!isFormValid.value) return;

  const employeeData: Omit<Employee, 'id' | 'evaluaciones'> = {
    nombre: form.value.nombre.trim(),
    apellido: form.value.apellido.trim(),
    email: form.value.email.trim(),
    telefono: form.value.telefono.trim(),
    cargo: form.value.cargo.trim(),
    departamento: form.value.departamento,
    fechaContratacion: new Date(form.value.fechaContratacion),
    salario: Number(form.value.salario),
    estado: form.value.estado,
    supervisor: form.value.supervisor || undefined,
    direccion: form.value.direccion.trim() || undefined,
    documentoIdentidad: form.value.documentoIdentidad.trim() || undefined,
    fechaNacimiento: form.value.fechaNacimiento
      ? new Date(form.value.fechaNacimiento)
      : undefined,
    notas: form.value.notas.trim() || undefined,
    habilidades: form.value.habilidades,
    proyectos: form.value.proyectos,
  };

  if (isEditing.value && props.employee) {
    // Update existing employee
    const updatedEmployee: Employee = {
      ...props.employee,
      ...employeeData,
    };
    emit("employee-saved", updatedEmployee);
  } else {
    // Create new employee
    emit("employee-saved", employeeData as Employee);
  }
};

const loadEmployeeData = () => {
  if (props.employee) {
    form.value = {
      nombre: props.employee.nombre,
      apellido: props.employee.apellido,
      email: props.employee.email,
      telefono: props.employee.telefono,
      cargo: props.employee.cargo,
      departamento: props.employee.departamento,
      fechaContratacion: props.employee.fechaContratacion
        .toISOString()
        .split("T")[0],
      salario: props.employee.salario,
      estado: props.employee.estado,
      supervisor: props.employee.supervisor || "",
      direccion: props.employee.direccion || "",
      documentoIdentidad: props.employee.documentoIdentidad || "",
      fechaNacimiento: props.employee.fechaNacimiento
        ? props.employee.fechaNacimiento.toISOString().split("T")[0]
        : "",
      notas: props.employee.notas || "",
      habilidades: props.employee.habilidades,
      proyectos: props.employee.proyectos,
    };

    habilidadesText.value = props.employee.habilidades.join(", ");
    proyectosText.value = props.employee.proyectos.join(", ");
  }
};

// Watchers
watch(
  () => props.employee,
  () => {
    if (props.employee) {
      loadEmployeeData();
    }
  },
  { immediate: true }
);

// Load initial data
onMounted(async () => {
  await employeesStore.loadEmployees();
});
</script>

<style scoped>
.employee-form {
  padding: 16px;
}

.form-actions {
  margin-top: 24px;
  padding: 0 16px;
}

ion-item-divider {
  margin-top: 16px;
}

ion-textarea {
  --padding-start: 0;
  --padding-end: 0;
}

ion-select {
  max-width: 100%;
}
</style> 