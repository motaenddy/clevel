<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Clientes</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddClientModal = true">
            <ion-icon :icon="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Clientes</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="clients-container">
        <!-- Search and Filters -->
        <ion-searchbar
          v-model="searchTerm"
          placeholder="Buscar clientes..."
          @ionInput="filterClients"
        ></ion-searchbar>

        <!-- View Toggle -->
        <ion-segment v-model="viewMode" @ionChange="onViewModeChange">
          <ion-segment-button value="list">
            <ion-icon :icon="list"></ion-icon>
            <ion-label>Listado</ion-label>
          </ion-segment-button>
          <ion-segment-button value="kanban">
            <ion-icon :icon="grid"></ion-icon>
            <ion-label>Negociaciones</ion-label>
          </ion-segment-button>
          <ion-segment-button value="implementaciones" class="disabled-segment">
            <ion-icon :icon="construct"></ion-icon>
            <ion-label>Implementaciones</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Filter Select (only for list view) -->
        <div v-if="viewMode === 'list'" class="filter-container">
          <ion-item>
            <ion-label>Filtrar por estado:</ion-label>
            <ion-select
              v-model="selectedFilter"
              @ionChange="filterClients"
              interface="popover"
              placeholder="Seleccionar filtro"
            >
              <ion-select-option value="all">Todos</ion-select-option>
              <ion-select-option value="active">Activos</ion-select-option>
              <ion-select-option value="implementacion"
                >En Implementación</ion-select-option
              >
              <ion-select-option value="negociacion"
                >En Negociación</ion-select-option
              >
              <ion-select-option value="inactive">Inactivos</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <ion-list>
            <ion-item
              v-for="cliente in filteredClients"
              :key="cliente.id"
              @click="viewClientDetail(cliente)"
              button
            >
              <ion-avatar slot="start">
                <ion-icon :icon="business" size="large"></ion-icon>
              </ion-avatar>

              <ion-label>
                <h2>{{ cliente.nombre }}</h2>
                <p>{{ cliente.email }}</p>
                <p v-if="cliente.montoPendiente > 0" class="pending-amount">
                  Pendiente: RD$ {{ formatCurrency(cliente.montoPendiente) }}
                </p>
                <div class="chips-container">
                  <ion-chip
                    v-if="cliente.etapaVenta"
                    :color="getStageColor(cliente.etapaVenta)"
                    size="small"
                  >
                    {{ getStageName(cliente.etapaVenta) }}
                  </ion-chip>
                  <ion-chip
                    color="primary"
                    @click.stop="quickBillClient(cliente)"
                    class="quick-bill-chip"
                  >
                    <ion-icon :icon="card"></ion-icon>
                    <ion-label>Facturar</ion-label>
                  </ion-chip>
                </div>
              </ion-label>

              <ion-note slot="end">
                <div v-if="cliente.cuotasVencidas > 0" class="overdue-badge">
                  {{ cliente.cuotasVencidas }} vencidas
                </div>
                <div v-else class="status-badge" :class="cliente.estado">
                  {{ cliente.estado }}
                </div>
              </ion-note>
            </ion-item>
          </ion-list>

          <!-- Empty State for List -->
          <div v-if="filteredClients.length === 0" class="empty-state">
            <ion-icon :icon="people" size="large"></ion-icon>
            <h3>No hay clientes</h3>
            <p>Agrega tu primer cliente para comenzar</p>
            <ion-button @click="showAddClientModal = true">
              Agregar Cliente
            </ion-button>
          </div>
        </div>

        <!-- Kanban View -->
        <div v-if="viewMode === 'kanban'" class="kanban-view">
          <SalesKanban
            :clients="filteredClients"
            @client-stage-changed="onClientStageChanged"
            @quick-bill="quickBillClient"
            @edit-client="editClient"
            @view-client-detail="showClientDetail"
          />
        </div>
      </div>
    </ion-content>

    <!-- Add Client Modal -->
    <ion-modal
      :is-open="showAddClientModal"
      @didDismiss="showAddClientModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Agregar Cliente</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddClientModal = false"
              >Cancelar</ion-button
            >
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ClientForm @client-saved="onClientSaved" />
      </ion-content>
    </ion-modal>

    <!-- Quick Billing Modal -->
    <ion-modal
      :is-open="showBillingModal"
      @didDismiss="showBillingModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title
            >Facturar - {{ selectedClientForBilling?.nombre }}</ion-title
          >
          <ion-buttons slot="end">
            <ion-button @click="showBillingModal = false">Cancelar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <BillingForm
          v-if="selectedClientForBilling"
          :client-id="selectedClientForBilling.id"
          @billing-saved="onBillingSaved"
        />
      </ion-content>
    </ion-modal>

    <!-- Client Detail Modal -->
    <ClientDetailModal
      :is-open="showClientDetailModal"
      :client="selectedClientForDetail"
      @close="closeClientDetailModal"
      @save="saveClientDetails"
    />
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
  IonMenuButton,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonNote,
  IonModal,
  IonChip,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import {
  add,
  business,
  people,
  card,
  list,
  grid,
  construct,
} from "ionicons/icons";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { useBillingStore } from "../stores/billing";
import ClientForm from "../components/ClientForm.vue";
import BillingForm from "../components/BillingForm.vue";
import SalesKanban from "../components/SalesKanban.vue";

import ClientDetailModal from "../components/ClientDetailModal.vue";

// Stores
const clientsStore = useClientsStore();
const billingStore = useBillingStore();

// Reactive data
const searchTerm = ref("");
const selectedFilter = ref("all");
const viewMode = ref("kanban");
const showAddClientModal = ref(false);
const showBillingModal = ref(false);
const selectedClientForBilling = ref(null);
const showClientDetailModal = ref(false);
const selectedClientForDetail = ref(null);

const router = useRouter();

// Computed properties
const filteredClients = computed(() => {
  // Use clients with dynamic financial data
  let filtered = clientsStore.getClientsWithFinancialData;

  // Filter by search term
  if (searchTerm.value) {
    filtered = filtered.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  // Filter by status (only in list view)
  if (viewMode.value === "list") {
    if (selectedFilter.value === "active") {
      filtered = filtered.filter((cliente) => cliente.estado === "activo");
    } else if (selectedFilter.value === "inactive") {
      filtered = filtered.filter((cliente) => cliente.estado === "inactivo");
    } else if (selectedFilter.value === "implementacion") {
      // Filtrar por clientes en implementación (color amarillo o azul)
      filtered = filtered.filter(
        (cliente) =>
          cliente.estado === "activo" &&
          (cliente.colorStatus === "amarillo" || cliente.colorStatus === "azul")
      );
    } else if (selectedFilter.value === "negociacion") {
      // Filtrar por clientes en negociación (etapa negociacion o propuesta)
      filtered = filtered.filter(
        (cliente) =>
          cliente.estado === "activo" &&
          (cliente.etapaVenta === "negociacion" ||
            cliente.etapaVenta === "propuesta")
      );
    }
    // Si es "all", no se aplica ningún filtro adicional
  }

  // In kanban view, show all active clients by default
  if (viewMode.value === "kanban") {
    filtered = filtered.filter((cliente) => cliente.estado === "activo");
  }

  return filtered;
});

// Methods
const filterClients = () => {
  // This will trigger the computed property
  console.log("Filtering clients...");
};

const viewClientDetail = (cliente: any) => {
  router.push(`/client/${cliente.id}`);
};

const quickBillClient = (cliente: any) => {
  // Store the selected client for billing
  selectedClientForBilling.value = cliente;
  showBillingModal.value = true;
};

const onClientSaved = async (newClient: any) => {
  try {
    await clientsStore.addClient(newClient);
    showAddClientModal.value = false;
  } catch (error) {
    console.error("Error saving client:", error);
  }
};

const onBillingSaved = async (billing: any) => {
  try {
    await billingStore.addBilling(billing);
    showBillingModal.value = false;
    selectedClientForBilling.value = null;
  } catch (error) {
    console.error("Error saving billing:", error);
  }
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

const onViewModeChange = () => {
  // Reset filters when switching views
  if (viewMode.value === "kanban") {
    selectedFilter.value = "all";
    searchTerm.value = ""; // Clear search in kanban view (negociaciones)
  } else if (viewMode.value === "list") {
    // Keep current filter when switching to list view
    // This allows users to maintain their filter preference
  } else if (viewMode.value === "implementaciones") {
    // Prevent switching to implementaciones for now
    // Reset to previous valid view
    viewMode.value = "kanban";
    console.log("Implementaciones view is not available yet");
  }
};

const onClientStageChanged = (client: any, newStage: string) => {
  console.log(`Cliente ${client.nombre} movido a etapa: ${newStage}`);
  // The store is already updated by the kanban component
};

const editClient = (client: any) => {
  // TODO: Implement edit client functionality
  console.log("Edit client:", client.nombre);
};

const getStageColor = (stage: string) => {
  const stageColors = {
    contacto: "primary",
    propuesta: "warning",
    negociacion: "tertiary",
    cierre: "success",
  };
  return stageColors[stage as keyof typeof stageColors] || "medium";
};

const getStageName = (stage: string) => {
  const stageNames = {
    contacto: "Contacto",
    propuesta: "Propuesta",
    negociacion: "Negociación",
    cierre: "Cierre",
  };
  return stageNames[stage as keyof typeof stageNames] || stage;
};

const onClientSelected = (client: any) => {
  console.log("Cliente seleccionado:", client.nombre);
  // Aquí puedes agregar lógica adicional para cuando se selecciona un cliente
};

const showClientDetail = (client: any) => {
  selectedClientForDetail.value = client;
  showClientDetailModal.value = true;
};

const closeClientDetailModal = () => {
  showClientDetailModal.value = false;
  selectedClientForDetail.value = null;
};

const saveClientDetails = async (updatedClient: any) => {
  try {
    await clientsStore.updateClient(updatedClient);
    showClientDetailModal.value = false;
    selectedClientForDetail.value = null;
  } catch (error) {
    console.error("Error updating client:", error);
  }
};

// Load initial data
onMounted(async () => {
  await clientsStore.loadClients();
  console.log("Clientes cargados:", clientsStore.clients.length);
  console.log(
    "Clientes con datos financieros:",
    clientsStore.getClientsWithFinancialData.length
  );
});
</script>

<style scoped>
.clients-container {
  padding: 16px;
}

.pending-amount {
  color: var(--ion-color-warning);
  font-weight: bold;
}

.overdue-badge {
  background: var(--ion-color-danger);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.activo {
  background: var(--ion-color-success);
  color: white;
}

.status-badge.inactivo {
  background: var(--ion-color-medium);
  color: white;
}

.quick-bill-chip {
  margin-top: 8px;
  cursor: pointer;
}

.quick-bill-chip:hover {
  opacity: 0.8;
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

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: var(--ion-color-dark);
}

.empty-state p {
  margin-bottom: 24px;
}

.kanban-view {
  height: calc(100vh - 200px);
  min-height: 600px;
  overflow: hidden;
}

.chips-container {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.filter-container {
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-container ion-item {
  --background: transparent;
  --border-color: transparent;
}

.filter-container ion-label {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.filter-container ion-select {
  --placeholder-color: var(--ion-color-medium);
}

/* Disabled segment styles */
.disabled-segment {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.disabled-segment ion-label {
  color: var(--ion-color-medium) !important;
}

.disabled-segment ion-icon {
  color: var(--ion-color-medium) !important;
}

/* Hover effect to show it's disabled */
.disabled-segment:hover {
  opacity: 0.3;
}
</style>
