import { Negotiation, NegotiationHistory, DEFAULT_NEGOTIATION_STAGES } from '../types/negotiation';

export class NegotiationService {
  private storageKey = 'ceo-app-negotiations';
  private historyKey = 'ceo-app-negotiation-history';

  // Obtener todas las negociaciones
  async getAllNegotiations(): Promise<Negotiation[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const negotiations = stored ? JSON.parse(stored) : [];
      
      // Migrar negociaciones existentes que no tienen sub-etapas
      const migratedNegotiations = negotiations.map((negotiation: any) => {
        if (!negotiation.stages || !negotiation.stages[0]?.subStages) {
          return {
            ...negotiation,
            stages: DEFAULT_NEGOTIATION_STAGES
          };
        }
        return negotiation;
      });
      
      // Guardar las negociaciones migradas si hubo cambios
      if (JSON.stringify(negotiations) !== JSON.stringify(migratedNegotiations)) {
        await this.saveNegotiations(migratedNegotiations);
      }
      
      return migratedNegotiations;
    } catch (error) {
      console.error('Error loading negotiations:', error);
      return [];
    }
  }

  // Obtener negociación por ID
  async getNegotiationById(id: string): Promise<Negotiation | null> {
    const negotiations = await this.getAllNegotiations();
    return negotiations.find(n => n.id === id) || null;
  }

  // Obtener negociaciones por cliente
  async getNegotiationsByClient(clientId: string): Promise<Negotiation[]> {
    const negotiations = await this.getAllNegotiations();
    return negotiations.filter(n => n.clientId === clientId);
  }

  // Crear nueva negociación
  async createNegotiation(negotiation: Omit<Negotiation, 'id' | 'lastUpdate'>): Promise<Negotiation> {
    const negotiations = await this.getAllNegotiations();
    
    // Asegurar que las etapas incluyan las sub-etapas predefinidas
    const stagesWithSubStages = DEFAULT_NEGOTIATION_STAGES.map(stage => ({
      ...stage,
      subStages: stage.subStages || []
    }));
    
    const newNegotiation: Negotiation = {
      ...negotiation,
      id: this.generateId(),
      lastUpdate: new Date(),
      stages: stagesWithSubStages,
      stageDates: { [negotiation.currentStage]: new Date() } // Fecha inicial para la etapa actual
    };

    negotiations.push(newNegotiation);
    await this.saveNegotiations(negotiations);
    
    // Crear historial inicial
    await this.addToHistory({
      id: this.generateId(),
      negotiationId: newNegotiation.id,
      stageId: newNegotiation.currentStage,
      stageName: this.getStageName(newNegotiation.currentStage),
      date: new Date(),
      notes: 'Negociación iniciada',
      userId: 'ceo'
    });

    return newNegotiation;
  }

  // Actualizar negociación
  async updateNegotiation(id: string, updates: Partial<Negotiation>): Promise<Negotiation | null> {
    const negotiations = await this.getAllNegotiations();
    const index = negotiations.findIndex(n => n.id === id);
    
    if (index === -1) return null;

    const oldNegotiation = negotiations[index];
    const updatedNegotiation: Negotiation = {
      ...oldNegotiation,
      ...updates,
      lastUpdate: new Date()
    };

    negotiations[index] = updatedNegotiation;
    await this.saveNegotiations(negotiations);

    // Si cambió la etapa, agregar al historial
    if (updates.currentStage && updates.currentStage !== oldNegotiation.currentStage) {
      await this.addToHistory({
        id: this.generateId(),
        negotiationId: id,
        stageId: updates.currentStage,
        stageName: this.getStageName(updates.currentStage),
        date: new Date(),
        notes: updates.notes || `Avanzó a etapa: ${this.getStageName(updates.currentStage)}`,
        userId: 'ceo'
      });
    }

    return updatedNegotiation;
  }

  // Avanzar a siguiente etapa
  async advanceToNextStage(negotiationId: string, notes?: string): Promise<Negotiation | null> {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;

    const currentStageIndex = negotiation.stages.findIndex(s => s.id === negotiation.currentStage);
    const nextStage = negotiation.stages[currentStageIndex + 1];

    if (!nextStage) return negotiation; // Ya está en la última etapa

    const updatedStageDates = { ...negotiation.stageDates };
    updatedStageDates[nextStage.id] = new Date();

    return await this.updateNegotiation(negotiationId, {
      currentStage: nextStage.id,
      stageDates: updatedStageDates,
      notes: notes || `Avanzó automáticamente a: ${nextStage.name}`
    });
  }

  // Retroceder a etapa anterior
  async goToPreviousStage(negotiationId: string, notes?: string): Promise<Negotiation | null> {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;

    const currentStageIndex = negotiation.stages.findIndex(s => s.id === negotiation.currentStage);
    const previousStage = negotiation.stages[currentStageIndex - 1];

    if (!previousStage) return negotiation; // Ya está en la primera etapa

    const updatedStageDates = { ...negotiation.stageDates };
    updatedStageDates[previousStage.id] = new Date();

    return await this.updateNegotiation(negotiationId, {
      currentStage: previousStage.id,
      stageDates: updatedStageDates,
      notes: notes || `Retrocedió a: ${previousStage.name}`
    });
  }

  // Ir a etapa específica
  async goToStage(negotiationId: string, stageId: string, notes?: string): Promise<Negotiation | null> {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;

    const updatedStageDates = { ...negotiation.stageDates };
    updatedStageDates[stageId] = new Date();

    return await this.updateNegotiation(negotiationId, {
      currentStage: stageId,
      stageDates: updatedStageDates,
      notes: notes || `Movido a etapa: ${this.getStageName(stageId)}`
    });
  }

  // Establecer fecha específica para una etapa
  async setStageDate(negotiationId: string, stageId: string, date: Date, notes?: string): Promise<Negotiation | null> {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;

    const updatedStageDates = { ...negotiation.stageDates };
    updatedStageDates[stageId] = date;

    return await this.updateNegotiation(negotiationId, {
      stageDates: updatedStageDates,
      notes: notes || `Fecha establecida para etapa: ${this.getStageName(stageId)}`
    });
  }

  // Obtener etapa específica de una negociación
  async getStage(negotiationId: string, stageId: string) {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;
    
    return negotiation.stages.find(stage => stage.id === stageId) || null;
  }

  // Actualizar sub-etapas de una etapa
  async updateStageSubStages(negotiationId: string, stageId: string, subStages: any[]): Promise<Negotiation | null> {
    const negotiation = await this.getNegotiationById(negotiationId);
    if (!negotiation) return null;

    const updatedStages = negotiation.stages.map(stage => {
      if (stage.id === stageId) {
        return { ...stage, subStages };
      }
      return stage;
    });

    return await this.updateNegotiation(negotiationId, {
      stages: updatedStages
    });
  }

  // Obtener historial de negociación
  async getNegotiationHistory(negotiationId: string): Promise<NegotiationHistory[]> {
    try {
      const stored = localStorage.getItem(this.historyKey);
      const allHistory: NegotiationHistory[] = stored ? JSON.parse(stored) : [];
      return allHistory
        .filter(h => h.negotiationId === negotiationId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error loading negotiation history:', error);
      return [];
    }
  }

  // Agregar entrada al historial
  private async addToHistory(entry: NegotiationHistory): Promise<void> {
    try {
      const stored = localStorage.getItem(this.historyKey);
      const history: NegotiationHistory[] = stored ? JSON.parse(stored) : [];
      history.push(entry);
      localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving negotiation history:', error);
    }
  }

  // Obtener estadísticas de negociaciones
  async getNegotiationStats(): Promise<{
    total: number;
    byStage: Record<string, number>;
    totalValue: number;
    averageProbability: number;
  }> {
    const negotiations = await this.getAllNegotiations();
    const byStage: Record<string, number> = {};
    let totalValue = 0;
    let totalProbability = 0;

    negotiations.forEach(negotiation => {
      const stage = negotiation.currentStage;
      byStage[stage] = (byStage[stage] || 0) + 1;
      totalValue += negotiation.estimatedValue;
      totalProbability += negotiation.probability;
    });

    return {
      total: negotiations.length,
      byStage,
      totalValue,
      averageProbability: negotiations.length > 0 ? totalProbability / negotiations.length : 0
    };
  }

  // Métodos auxiliares
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getStageName(stageId: string): string {
    const stage = DEFAULT_NEGOTIATION_STAGES.find(s => s.id === stageId);
    return stage ? stage.name : 'Etapa Desconocida';
  }

  private async saveNegotiations(negotiations: Negotiation[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(negotiations));
    } catch (error) {
      console.error('Error saving negotiations:', error);
    }
  }
} 