<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            :default-href="`/client/${clientId}`"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Facturación - {{ client?.nombre }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddBillingModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información de facturación...</p>
      </div>

      <div v-else-if="!client" class="error-container">
        <ion-icon :icon="alert" size="large" color="danger"></ion-icon>
        <h3>Cliente no encontrado</h3>
        <ion-button @click="$router.push('/clients')">
          Volver a Clientes
        </ion-button>
      </div>

      <div v-else class="billing-container">
        <!-- Financial Summary Cards -->
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-card class="summary-card">
                <ion-card-content>
                  <div class="summary-item">
                    <h3>Total Facturado</h3>
                    <p class="amount total-billed">
                      RD$ {{ totalBilled.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="summary-card">
                <ion-card-content>
                  <div class="summary-item">
                    <h3>Total Pagado</h3>
                    <p class="amount total-paid">
                      RD$ {{ totalPaid.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-card class="summary-card">
                <ion-card-content>
                  <div class="summary-item">
                    <h3>Pendiente</h3>
                    <p class="amount pending">
                      RD$ {{ totalPending.toLocaleString("es-DO") }}
                    </p>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="summary-card">
                <ion-card-content>
                  <div class="summary-item">
                    <h3>% Pagado</h3>
                    <p class="amount percentage">
                      {{ paymentPercentage.toFixed(1) }}%
                    </p>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Filters -->
        <ion-card>
          <ion-card-content>
            <ion-segment v-model="selectedFilter" @ionChange="filterBilling">
              <ion-segment-button value="all">
                <ion-label>Todos</ion-label>
              </ion-segment-button>
              <ion-segment-button value="pending">
                <ion-label>Pendientes</ion-label>
              </ion-segment-button>
              <ion-segment-button value="overdue">
                <ion-label>Vencidos</ion-label>
              </ion-segment-button>
              <ion-segment-button value="paid">
                <ion-label>Pagados</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-card-content>
        </ion-card>

        <!-- Billing History -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historial de Facturación</ion-card-title>
            <ion-button slot="end" fill="clear" @click="exportBillingData">
              <ion-icon :icon="download"></ion-icon>
              Exportar
            </ion-button>
          </ion-card-header>
          <ion-card-content>
            <div v-if="filteredBilling.length === 0" class="empty-state">
              <ion-icon :icon="document" size="large"></ion-icon>
              <p>{{ getEmptyStateMessage() }}</p>
              <ion-button
                v-if="selectedFilter === 'all'"
                @click="showAddBillingModal = true"
              >
                Agregar Primera Facturación
              </ion-button>
            </div>

            <ion-list v-else>
              <ion-item
                v-for="billing in filteredBilling"
                :key="billing.id"
                button
                @click="editBilling(billing)"
              >
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
                  <p v-if="billing.fechaVencimiento">
                    Vence: {{ formatDate(billing.fechaVencimiento) }}
                  </p>
                </ion-label>
                <ion-note slot="end">
                  <ion-badge :color="getStatusColor(billing.estado)">
                    {{ getStatusLabel(billing.estado) }}
                  </ion-badge>
                  <div class="billing-actions">
                    <ion-button
                      v-if="billing.estado !== 'pagado'"
                      fill="clear"
                      size="small"
                      @click.stop="markAsPaid(billing)"
                    >
                      <ion-icon :icon="checkmark"></ion-icon>
                    </ion-button>
                    <ion-button
                      v-if="billing.estado === 'vencido'"
                      fill="clear"
                      size="small"
                      @click.stop="sendReminder(billing)"
                    >
                      <ion-icon :icon="mail"></ion-icon>
                    </ion-button>
                  </div>
                </ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Payment Trends Chart Placeholder -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Tendencias de Pago</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-placeholder">
              <ion-icon :icon="analytics" size="large"></ion-icon>
              <p>Gráfico de tendencias de pago</p>
              <ion-button fill="outline" size="small">
                Ver Detalles
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- Add/Edit Billing Modal -->
    <ion-modal
      :is-open="showAddBillingModal"
      @didDismiss="showAddBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title
            >{{ editingBilling ? "Editar" : "Agregar" }} Facturación</ion-title
          >
          <ion-buttons slot="end">
            <ion-button @click="showAddBillingModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm
          :client-id="clientId"
          :billing="editingBilling"
          @billing-saved="onBillingSaved"
        />
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
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import {
  add,
  alert,
  document,
  checkmark,
  mail,
  download,
  analytics,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import BillingForm from "../components/BillingForm.vue";
import type { MonthlyBilling } from "../services/StorageService";

// Route
const route = useRoute();

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const loading = ref(true);
const showAddBillingModal = ref(false);
const selectedFilter = ref("all");
const editingBilling = ref<MonthlyBilling | null>(null);

// Computed properties
const clientId = computed(() => route.params.id as string);
const client = computed(() => clientsStore.getClientById(clientId.value));
const billingHistory = computed(() =>
  billingStore.getBillingByClient(clientId.value)
);

const filteredBilling = computed(() => {
  if (selectedFilter.value === "all") return billingHistory.value;
  return billingHistory.value.filter((b) => b.estado === selectedFilter.value);
});

const totalBilled = computed(() =>
  billingHistory.value.reduce((sum, b) => sum + b.montoFacturado, 0)
);

const totalPaid = computed(() =>
  billingHistory.value.reduce((sum, b) => sum + b.montoPagado, 0)
);

const totalPending = computed(() => totalBilled.value - totalPaid.value);

const paymentPercentage = computed(() =>
  totalBilled.value > 0 ? (totalPaid.value / totalBilled.value) * 100 : 0
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-DO");
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

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
  };
  return labels[status] || status;
};

const getEmptyStateMessage = () => {
  switch (selectedFilter.value) {
    case "pending":
      return "No hay facturación pendiente";
    case "overdue":
      return "No hay facturación vencida";
    case "paid":
      return "No hay facturación pagada";
    default:
      return "No hay facturación registrada";
  }
};

const filterBilling = () => {
  // Filter is handled by computed property
};

const editBilling = (billing: MonthlyBilling) => {
  editingBilling.value = billing;
  showAddBillingModal.value = true;
};

const markAsPaid = async (billing: MonthlyBilling) => {
  try {
    const updatedBilling = { ...billing, estado: "pagado" as const };
    await billingStore.updateBilling(updatedBilling);
  } catch (error) {
    console.error("Error marking as paid:", error);
  }
};

const sendReminder = (billing: MonthlyBilling) => {
  // TODO: Implement send reminder functionality
  console.log("Send reminder for:", billing);
};

const exportBillingData = () => {
  // TODO: Implement export functionality
  console.log("Export billing data");
};

const onBillingSaved = async (billing: MonthlyBilling) => {
  try {
    if (editingBilling.value) {
      await billingStore.updateBilling(billing);
    } else {
      await billingStore.addBilling(billing);
    }
    showAddBillingModal.value = false;
    editingBilling.value = null;
  } catch (error) {
    console.error("Error saving billing:", error);
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
.billing-container {
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

.summary-card {
  margin-bottom: 8px;
}

.summary-item {
  text-align: center;
  padding: 8px;
}

.summary-item h3 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.amount {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.amount.total-billed {
  color: var(--ion-color-primary);
}

.amount.total-paid {
  color: var(--ion-color-success);
}

.amount.pending {
  color: var(--ion-color-warning);
}

.amount.percentage {
  color: var(--ion-color-secondary);
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

.billing-actions {
  margin-top: 8px;
  display: flex;
  gap: 4px;
}

.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.chart-placeholder ion-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.chart-placeholder p {
  margin-bottom: 16px;
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
  font-size: 0.9rem;
}

ion-segment {
  margin-bottom: 16px;
}
</style>
