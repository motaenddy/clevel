<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/clients"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ client?.nombre || "Detalle del Cliente" }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información del cliente...</p>
      </div>

      <div v-else-if="!client" class="error-container">
        <ion-icon :icon="alert" size="large" color="danger"></ion-icon>
        <h3>Cliente no encontrado</h3>
        <ion-button @click="$router.push('/clients')">
          Volver a Clientes
        </ion-button>
      </div>

      <div v-else class="client-detail-container">
        <!-- Client Information Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Información del Cliente</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item button @click="editField('nombre')">
                <ion-label>
                  <h3>Nombre</h3>
                  <p>{{ client.nombre }}</p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>

              <ion-item v-if="client.email" button @click="editField('email')">
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ client.email }}</p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>

              <ion-item
                v-if="client.telefono"
                button
                @click="editField('telefono')"
              >
                <ion-label>
                  <h3>Teléfono</h3>
                  <p>{{ client.telefono }}</p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>

              <ion-item
                v-if="client.direccion"
                button
                @click="editField('direccion')"
              >
                <ion-label>
                  <h3>Dirección</h3>
                  <p>{{ client.direccion }}</p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>

              <ion-item button @click="editField('estado')">
                <ion-label>
                  <h3>Estado</h3>
                  <p>
                    <ion-badge
                      :color="client.estado === 'activo' ? 'success' : 'medium'"
                    >
                      {{ client.estado }}
                    </ion-badge>
                  </p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>

              <ion-item v-if="client.notas" button @click="editField('notas')">
                <ion-label>
                  <h3>Notas</h3>
                  <p>{{ client.notas }}</p>
                </ion-label>
                <ion-icon slot="end" :icon="create" color="medium"></ion-icon>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Financial Summary Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Resumen Financiero</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Monto Pendiente</h4>
                    <p class="amount pending">
                      RD$
                      {{ (client.montoPendiente || 0).toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="financial-item">
                    <h4>Cuotas Vencidas</h4>
                    <p class="amount overdue">
                      {{ client.cuotasVencidas || 0 }}
                    </p>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Billing History Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historial de Facturación</ion-card-title>
            <ion-button
              slot="end"
              fill="clear"
              @click="showAddBillingModal = true"
            >
              <ion-icon :icon="add"></ion-icon>
              Agregar Facturación
            </ion-button>
          </ion-card-header>
          <ion-card-content>
            <div v-if="billingHistory.length === 0" class="empty-state">
              <ion-icon :icon="document" size="large"></ion-icon>
              <p>No hay facturación registrada</p>
              <ion-button @click="showAddBillingModal = true">
                Agregar Primera Facturación
              </ion-button>
            </div>

            <ion-list v-else>
              <ion-item v-for="billing in billingHistory" :key="billing.id">
                <ion-label>
                  <h3>{{ formatMonth(billing.mes) }}</h3>
                  <p>
                    Facturado: RD$
                    {{ billing.montoFacturado.toLocaleString("es-DO") }}
                  </p>
                  <p>
                    Pagado: RD$
                    {{ billing.montoPagado.toLocaleString("es-DO") }}
                  </p>
                </ion-label>
                <ion-note slot="end">
                  <ion-badge :color="getStatusColor(billing.estado)">
                    {{ billing.estado }}
                  </ion-badge>
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Quick Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Acciones Rápidas</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button
              expand="block"
              @click="markAsPaid"
              :disabled="!hasPendingBilling"
            >
              <ion-icon :icon="checkmark" slot="start"></ion-icon>
              Marcar como Pagado
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              @click="sendReminder"
              :disabled="!hasOverdueBilling"
            >
              <ion-icon :icon="mail" slot="start"></ion-icon>
              Enviar Recordatorio
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="navigateToBilling" color="primary">
          <ion-icon :icon="card"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Edit Field Modal -->
    <ion-modal
      :is-open="showEditFieldModal"
      @didDismiss="showEditFieldModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Editar {{ getFieldLabel(editingField) }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showEditFieldModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="edit-field-container">
          <ion-item>
            <ion-label position="stacked">{{
              getFieldLabel(editingField)
            }}</ion-label>
            <ion-input
              v-if="editingField !== 'estado'"
              v-model="editingValue"
              :type="getInputType(editingField)"
              :placeholder="getFieldPlaceholder(editingField)"
            ></ion-input>
            <ion-select
              v-else
              v-model="editingValue"
              placeholder="Selecciona el estado"
            >
              <ion-select-option value="activo">Activo</ion-select-option>
              <ion-select-option value="inactivo">Inactivo</ion-select-option>
            </ion-select>
          </ion-item>
          <div class="edit-actions">
            <ion-button expand="block" @click="saveField">
              Guardar Cambios
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Add Billing Modal -->
    <ion-modal
      :is-open="showAddBillingModal"
      @didDismiss="showAddBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Facturación</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddBillingModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm :client-id="clientId" @billing-saved="onBillingAdded" />
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonSpinner,
  IonFab,
  IonFabButton,
} from "@ionic/vue";
import { create, alert, add, document, checkmark, card } from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import BillingForm from "../components/BillingForm.vue";

// Route and router
const route = useRoute();
const router = useRouter();

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const loading = ref(true);
const showEditFieldModal = ref(false);
const showAddBillingModal = ref(false);
const editingField = ref("");
const editingValue = ref("");

// Computed properties
const clientId = computed(() => route.params.id as string);
const client = computed(() => clientsStore.getClientById(clientId.value));
const billingHistory = computed(() =>
  billingStore.getBillingByClient(clientId.value)
);

const hasPendingBilling = computed(() =>
  billingHistory.value.some((b) => b.estado === "pendiente")
);

const hasOverdueBilling = computed(() =>
  billingHistory.value.some((b) => b.estado === "vencido")
);

// Methods
const formatMonth = (month: string) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pagado":
      return "success";
    case "pendiente":
      return "warning";
    case "vencido":
      return "danger";
    default:
      return "medium";
  }
};

const sendEmail = () => {
  if (client.value?.email) {
    window.open(`mailto:${client.value.email}`, "_blank");
  }
};

const callClient = () => {
  if (client.value?.telefono) {
    window.open(`tel:${client.value.telefono}`, "_blank");
  }
};

const editField = (field: string) => {
  editingField.value = field;
  editingValue.value = client.value?.[field] || "";
  showEditFieldModal.value = true;
};

const getFieldLabel = (field: string) => {
  const labels: { [key: string]: string } = {
    nombre: "Nombre",
    email: "Email",
    telefono: "Teléfono",
    direccion: "Dirección",
    estado: "Estado",
    notas: "Notas",
  };
  return labels[field] || field;
};

const getInputType = (field: string) => {
  const types: { [key: string]: string } = {
    nombre: "text",
    email: "email",
    telefono: "tel",
    direccion: "text",
    notas: "text",
  };
  return types[field] || "text";
};

const getFieldPlaceholder = (field: string) => {
  const placeholders: { [key: string]: string } = {
    nombre: "Ingresa el nombre del cliente",
    email: "ejemplo@cliente.com",
    telefono: "809-555-0000",
    direccion: "Dirección completa del cliente",
    notas: "Notas adicionales sobre el cliente",
  };
  return placeholders[field] || "";
};

const saveField = async () => {
  if (!client.value || !editingField.value) return;

  try {
    const updatedClient = { ...client.value };
    updatedClient[editingField.value] = editingValue.value;

    await clientsStore.updateClient(updatedClient);
    showEditFieldModal.value = false;
  } catch (error) {
    console.error("Error updating client field:", error);
  }
};

const markAsPaid = () => {
  // TODO: Implement mark as paid functionality
  console.log("Mark as paid clicked");
};

const navigateToBilling = () => {
  router.push(`/client/${clientId.value}/billing`);
};

const sendReminder = () => {
  // TODO: Implement send reminder functionality
  console.log("Send reminder clicked");
};

const onBillingAdded = async (newBilling: any) => {
  try {
    await billingStore.addBilling(newBilling);
    showAddBillingModal.value = false;
  } catch (error) {
    console.error("Error adding billing:", error);
  }
};

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([clientsStore.loadClients(), billingStore.loadBilling()]);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.client-detail-container {
  padding: 16px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
}

.financial-item {
  text-align: center;
  padding: 8px;
}

.financial-item h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.amount.pending {
  color: var(--ion-color-warning);
}

.amount.overdue {
  color: var(--ion-color-danger);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 24px;
}

ion-card {
  margin-bottom: 16px;
}

ion-item h3 {
  font-weight: 600;
  margin-bottom: 4px;
}

ion-item p {
  margin: 0;
  color: var(--ion-color-medium);
}

.edit-field-container {
  padding: 16px;
}

.edit-actions {
  margin-top: 24px;
  padding: 0 16px;
}

ion-item[button] {
  cursor: pointer;
}

ion-item[button]:hover {
  background-color: var(--ion-color-light);
}
</style>
