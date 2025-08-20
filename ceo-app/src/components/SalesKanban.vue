<template>
  <div class="kanban-container">
    <div class="kanban-board">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="kanban-column"
        :class="stage.id"
      >
        <div class="column-header">
          <h3>{{ stage.name }}</h3>
          <ion-badge color="medium">{{
            getClientsInStage(stage.id).length
          }}</ion-badge>
        </div>

        <div
          class="column-content"
          @drop="onDrop($event, stage.id)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="client in getClientsInStage(stage.id)"
            :key="client.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart($event, client)"
            @click="viewClientDetail(client)"
          >
            <div class="card-header">
              <h4>{{ client.nombre }}</h4>
              <ion-chip :color="getStageColor(stage.id)" size="small">
                {{ stage.name }}
              </ion-chip>
            </div>

            <div class="card-content">
              <p class="client-email">{{ client.email }}</p>
              <p class="client-phone">{{ client.telefono }}</p>

              <!-- Información detallada del centro -->
              <div v-if="getCentroDetallado(client.id)" class="centro-info">
                <div class="info-row">
                  <ion-icon :icon="business" size="small"></ion-icon>
                  <span
                    >{{
                      getCentroDetallado(client.id)?.informacionGeneral
                        .numeroConsultorios
                    }}
                    consultorios</span
                  >
                </div>
                <div class="info-row">
                  <ion-icon :icon="people" size="small"></ion-icon>
                  <span
                    >{{
                      getCentroDetallado(client.id)?.informacionGeneral
                        .numeroMedicos
                    }}
                    médicos</span
                  >
                </div>
                <div class="info-row presupuesto">
                  <ion-icon :icon="cash" size="small"></ion-icon>
                  <span
                    >RD$
                    {{
                      formatCurrency(
                        getCentroDetallado(client.id)?.presupuestoEstimado || 0
                      )
                    }}</span
                  >
                </div>
                <div class="info-row probabilidad">
                  <ion-icon :icon="trendingUp" size="small"></ion-icon>
                  <span
                    >{{ getCentroDetallado(client.id)?.probabilidadCierre }}%
                    prob.</span
                  >
                </div>
              </div>

              <div v-if="client.montoPendiente > 0" class="pending-amount">
                Pendiente: RD$ {{ formatCurrency(client.montoPendiente) }}
              </div>

              <div v-if="client.cuotasVencidas > 0" class="overdue-info">
                {{ client.cuotasVencidas }} cuotas vencidas
              </div>
            </div>

            <div class="card-actions">
              <!-- Indicador de cotizador disponible -->
              <ion-chip
                v-if="
                  client.etapaVenta === 'propuesta' ||
                  client.etapaVenta === 'negociacion'
                "
                color="tertiary"
                size="small"
                class="quoter-indicator"
              >
                <ion-icon :icon="calculator" size="small"></ion-icon>
                <ion-label>Cotizador</ion-label>
              </ion-chip>

              <ion-button
                size="small"
                fill="clear"
                @click.stop="quickBillClient(client)"
              >
                <ion-icon :icon="card" slot="icon-only"></ion-icon>
              </ion-button>

              <ion-button
                size="small"
                fill="clear"
                @click.stop="editClient(client)"
              >
                <ion-icon :icon="create" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </div>

          <!-- Empty state for column -->
          <div
            v-if="getClientsInStage(stage.id).length === 0"
            class="empty-column"
          >
            <ion-icon :icon="business" size="large"></ion-icon>
            <p>No hay centros en esta etapa</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonBadge, IonChip, IonButton, IonIcon } from "@ionic/vue";
import {
  card,
  create,
  business,
  people,
  cash,
  trendingUp,
  calculator,
} from "ionicons/icons";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useClientsStore } from "../stores/clients";
import { salesDataService } from "../services/SalesDataService";
import type { Client } from "../services/StorageService";

// Props
interface Props {
  clients: Client[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "client-stage-changed": [client: Client, newStage: string];
  "quick-bill": [client: Client];
  "edit-client": [client: Client];
  "view-client-detail": [client: Client];
}>();

const router = useRouter();
const clientsStore = useClientsStore();

// Sales stages
const stages = [
  { id: "contacto", name: "Contacto", color: "primary" },
  { id: "propuesta", name: "Propuesta", color: "warning" },
  { id: "negociacion", name: "Negociación", color: "tertiary" },
  { id: "cierre", name: "Cierre", color: "success" },
];

// Computed
const getClientsInStage = computed(() => (stageId: string) => {
  return props.clients.filter((client) => client.etapaVenta === stageId);
});

// Methods
const onDragStart = (event: DragEvent, client: Client) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", JSON.stringify(client));
    event.dataTransfer.effectAllowed = "move";
  }
};

const onDrop = async (event: DragEvent, newStage: string) => {
  event.preventDefault();

  if (event.dataTransfer) {
    const clientData = event.dataTransfer.getData("text/plain");
    const client: Client = JSON.parse(clientData);

    if (client.etapaVenta !== newStage) {
      // Update client stage
      const updatedClient = { ...client, etapaVenta: newStage };

      try {
        await clientsStore.updateClient(updatedClient);
        emit("client-stage-changed", updatedClient, newStage);
      } catch (error) {
        console.error("Error updating client stage:", error);
      }
    }
  }
};

const getStageColor = (stageId: string) => {
  const stage = stages.find((s) => s.id === stageId);
  return stage?.color || "medium";
};

const viewClientDetail = (client: Client) => {
  emit("view-client-detail", client);
};

const quickBillClient = (client: Client) => {
  emit("quick-bill", client);
};

const editClient = (client: Client) => {
  emit("edit-client", client);
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("es-DO");
};

const getCentroDetallado = (clientId: string) => {
  return salesDataService.getCentroDetallado(clientId);
};
</script>

<style scoped>
.kanban-container {
  padding: 8px;
  height: 100%;
  overflow-x: auto;
}

.kanban-board {
  display: flex;
  gap: 12px;
  min-width: 100%;
  height: 100%;
}

.kanban-column {
  flex: 1;
  min-width: 250px;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.kanban-column.contacto {
  border-top: 4px solid var(--ion-color-primary);
}

.kanban-column.propuesta {
  border-top: 4px solid var(--ion-color-warning);
}

.kanban-column.negociacion {
  border-top: 4px solid var(--ion-color-tertiary);
}

.kanban-column.cierre {
  border-top: 4px solid var(--ion-color-success);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ion-color-medium);
}

.column-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.column-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 300px;
  overflow-y: auto;
}

.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--ion-color-light-shade);
  position: relative;
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
  border-color: var(--ion-color-primary);
}

.kanban-card::before {
  content: "👁️ Click para ver detalles";
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ion-color-dark);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}

.kanban-card:hover::before {
  opacity: 1;
}

.kanban-card:active {
  cursor: grabbing;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  line-height: 1.3;
  flex: 1;
  margin-right: 8px;
}

.card-content {
  margin-bottom: 12px;
}

.client-email,
.client-phone {
  margin: 4px 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium-shade);
}

.pending-amount {
  color: var(--ion-color-warning);
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 8px;
}

.overdue-info {
  color: var(--ion-color-danger);
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 4px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  border-top: 1px solid var(--ion-color-light);
  padding-top: 8px;
}

.quoter-indicator {
  font-size: 0.7rem;
  height: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.card-actions .action-buttons {
  display: flex;
  gap: 4px;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
  text-align: center;
  flex: 1;
}

.empty-column ion-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-column p {
  margin: 0;
  font-size: 0.9rem;
}

.centro-info {
  margin: 12px 0;
  padding: 8px;
  background: var(--ion-color-light);
  border-radius: 6px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
  font-size: 0.8rem;
  color: var(--ion-color-medium-shade);
}

.info-row ion-icon {
  color: var(--ion-color-medium);
}

.info-row.presupuesto {
  color: var(--ion-color-success);
  font-weight: 600;
}

.info-row.probabilidad {
  color: var(--ion-color-tertiary);
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .kanban-board {
    flex-direction: column;
  }

  .kanban-column {
    min-width: 100%;
  }

  .column-content {
    min-height: 150px;
  }
}
</style>
