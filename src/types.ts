export enum Priority {
  P1 = 1,
  P2 = 2,
  P3 = 3,
  P4 = 4
}

export interface Status {
  id: string;
  name: string;
  color?: string;
}

export interface User {
  name: string;
  email: string;
}

export interface ProjectAction {
  id: string;
  description: string;
  responsible: string;
  deadline: string;
  completionDate?: string;
  observation?: string;
  stage: 'Estudo Técnico' | 'Execução';
}

export interface Project {
  id: string;
  priority: Priority;
  number: string;
  name: string;
  funnelNumber: string;
  status: string;
  leader: string;
  team: string[];
  actions: ProjectAction[];
  createdAt: string;
  completionDate?: string;
  
  // New Date Fields
  openingDate: string;
  overallDeadline: string;
  overallExtension?: string;
  
  techStudyStart?: string;
  techStudyDeadline?: string;
  techStudyExtension?: string;
  
  executionStart?: string;
  executionDeadline?: string;
  executionExtension?: string;
  
  justification?: string;
  productLineId?: string;
}

export interface UserAvailability {
  userName: string;
  weeklyHours: number;
}

export interface TimeAllocation {
  id: string;
  userName: string;
  projectId?: string;
  activityType?: string;
  hours: number;
  week: string;
}

export interface ProductLine {
  id: string;
  name: string;
}

export interface ProductionLine {
  id: string;
  name: string;
}

export interface ForecastedTest {
  id: string;
  productLineId: string;
  productionLineId?: string;
  projectId: string;
  forecastMonth: string;
  originalForecastMonth?: string;
  rescheduleJustification?: string;
  description: string;
  programmedTime: number;
  complexity: 'Baixa' | 'Média' | 'Alta';
  responsible: string;
  observation: string;
  status: 'Não Programado' | 'Execução Agendada' | 'Finalizado';
  
  scheduledDate?: string;
  executionResponsible?: string;
  needsPreTestMeeting: boolean;
  needsPostTestMeeting: boolean;
  completionDate?: string;
  realTimePerformed?: number;
  programmingObservation?: string;
}

export interface ProductLineBudget {
  id: string;
  productLineId: string;
  month: string; // YYYY-MM
  budgetedHours: number;
  extraHours?: number;
  extraHoursJustification?: string;
  extraHoursObservation?: string;
}
