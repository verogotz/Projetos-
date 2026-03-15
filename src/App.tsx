import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  User, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronDown,
  Trash2,
  Edit2,
  X,
  ArrowRight,
  UserPlus,
  LayoutDashboard,
  ListTodo,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Bell,
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Priority, Project, ProjectAction, User as UserType, Status, UserAvailability, TimeAllocation, ProductLine, ProductionLine, ForecastedTest, ProductLineBudget } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([
    { name: "Ana Silva", email: "ana@exemplo.com" },
    { name: "Bruno Costa", email: "bruno@exemplo.com" },
    { name: "Carla Dias", email: "carla@exemplo.com" }
  ]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(["Execução", "Não Iniciado", "Finalizado", "Stand By"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectListModalOpen, setIsProjectListModalOpen] = useState(false);
  const [isPendingActionsModalOpen, setIsPendingActionsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | 'All'>('All');
  const [view, setView] = useState<'list' | 'stats'>('list');
  const [notifications, setNotifications] = useState<{ id: string; message: string; date: string; read: boolean }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userAvailabilities, setUserAvailabilities] = useState<UserAvailability[]>([]);
  const [timeAllocations, setTimeAllocations] = useState<TimeAllocation[]>([]);
  const [activityTypes, setActivityTypes] = useState<string[]>(["Reunião", "Treinamento", "Folga", "Administrativo"]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [forecastedTests, setForecastedTests] = useState<ForecastedTest[]>([]);
  const [productLineBudgets, setProductLineBudgets] = useState<ProductLineBudget[]>([]);
  const [isTestForecastModalOpen, setIsTestForecastModalOpen] = useState(false);
  const [productLineFilter, setProductLineFilter] = useState<string | 'All'>('All');

  // Load from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('gestor_projetos_data');
    const savedUsers = localStorage.getItem('gestor_projetos_users');
    const savedNotifications = localStorage.getItem('gestor_projetos_notifications');
    const savedStatuses = localStorage.getItem('gestor_projetos_statuses');
    const savedAvailabilities = localStorage.getItem('gestor_projetos_availabilities');
    const savedAllocations = localStorage.getItem('gestor_projetos_allocations');
    const savedActivityTypes = localStorage.getItem('gestor_projetos_activity_types');
    const savedProductLines = localStorage.getItem('gestor_projetos_product_lines');
    const savedProductionLines = localStorage.getItem('gestor_projetos_production_lines');
    const savedForecastedTests = localStorage.getItem('gestor_projetos_forecasted_tests');
    const savedBudgets = localStorage.getItem('gestor_projetos_budgets');
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        // Migration: ensure leader, team members and action responsibles are strings, not objects
        const migratedProjects = parsedProjects.map((p: any) => ({
          ...p,
          leader: typeof p.leader === 'object' && p.leader !== null ? p.leader.name : p.leader,
          team: Array.isArray(p.team) ? p.team.map((m: any) => typeof m === 'object' && m !== null ? m.name : m) : [],
          actions: Array.isArray(p.actions) ? p.actions.map((a: any) => ({
            ...a,
            responsible: typeof a.responsible === 'object' && a.responsible !== null ? a.responsible.name : a.responsible
          })) : []
        }));
        setProjects(migratedProjects);
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        // Migration: if the saved users are just strings, convert them to objects
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0 && typeof parsedUsers[0] === 'string') {
          setAvailableUsers(parsedUsers.map((name: string) => ({ name, email: "" })));
        } else {
          setAvailableUsers(parsedUsers || []);
        }
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications) || []);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }

    if (savedStatuses) {
      try {
        const parsedStatuses = JSON.parse(savedStatuses);
        // Migration: ensure statuses are strings, not objects
        if (Array.isArray(parsedStatuses)) {
          const migratedStatuses = parsedStatuses.map((s: any) => 
            typeof s === 'object' && s !== null ? (s.name || s.label || "") : s
          ).filter(Boolean);
          setAvailableStatuses(migratedStatuses);
        } else {
          setAvailableStatuses(["Execução", "Não Iniciado", "Finalizado", "Stand By"]);
        }
      } catch (e) {
        console.error("Failed to parse statuses", e);
      }
    }

    if (savedAvailabilities) {
      try {
        setUserAvailabilities(JSON.parse(savedAvailabilities) || []);
      } catch (e) {
        console.error("Failed to parse availabilities", e);
      }
    }

    if (savedAllocations) {
      try {
        setTimeAllocations(JSON.parse(savedAllocations) || []);
      } catch (e) {
        console.error("Failed to parse allocations", e);
      }
    }

    if (savedActivityTypes) {
      try {
        setActivityTypes(JSON.parse(savedActivityTypes) || ["Reunião", "Treinamento", "Folga", "Administrativo"]);
      } catch (e) {
        console.error("Failed to parse activity types", e);
      }
    }

    if (savedProductLines) {
      try {
        setProductLines(JSON.parse(savedProductLines) || []);
      } catch (e) {
        console.error("Failed to parse product lines", e);
      }
    }

    if (savedProductionLines) {
      try {
        setProductionLines(JSON.parse(savedProductionLines) || []);
      } catch (e) {
        console.error("Failed to parse production lines", e);
      }
    }

    if (savedForecastedTests) {
      try {
        setForecastedTests(JSON.parse(savedForecastedTests) || []);
      } catch (e) {
        console.error("Failed to parse forecasted tests", e);
      }
    }

    if (savedBudgets) {
      try {
        setProductLineBudgets(JSON.parse(savedBudgets) || []);
      } catch (e) {
        console.error("Failed to parse budgets", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('gestor_projetos_data', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_users', JSON.stringify(availableUsers));
  }, [availableUsers]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_statuses', JSON.stringify(availableStatuses));
  }, [availableStatuses]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_availabilities', JSON.stringify(userAvailabilities));
  }, [userAvailabilities]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_allocations', JSON.stringify(timeAllocations));
  }, [timeAllocations]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_activity_types', JSON.stringify(activityTypes));
  }, [activityTypes]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_product_lines', JSON.stringify(productLines));
  }, [productLines]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_production_lines', JSON.stringify(productionLines));
  }, [productionLines]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_forecasted_tests', JSON.stringify(forecastedTests));
  }, [forecastedTests]);

  useEffect(() => {
    localStorage.setItem('gestor_projetos_budgets', JSON.stringify(productLineBudgets));
  }, [productLineBudgets]);

  const handleAddProject = (project: Project) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? project : p));
    } else {
      setProjects([project, ...projects]);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleAddUser = (user: UserType) => {
    if (user.name && !availableUsers.find(u => u.name === user.name)) {
      setAvailableUsers([...availableUsers, user]);
    }
  };

  const handleDeleteUser = (name: string) => {
    setAvailableUsers(prev => prev.filter(u => u.name !== name));
    // Also remove from all projects' teams
    setProjects(prev => prev.map(p => ({
      ...p,
      team: p.team.filter(n => n !== name),
      leader: p.leader === name ? "" : p.leader
    })));
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesLine = productLineFilter === 'All' || p.productLineId === productLineFilter;
    return matchesSearch && matchesStatus && matchesLine;
  }).sort((a, b) => a.priority - b.priority);

  const handleUpdateProject = (updatedProject: Project) => {
    // Detect new mentions for notifications
    const oldProject = projects.find(p => p.id === updatedProject.id);
    if (oldProject) {
      updatedProject.actions.forEach(newAction => {
        const oldAction = oldProject.actions.find(a => a.id === newAction.id);
        const oldObs = oldAction?.observation || "";
        const newObs = newAction.observation || "";
        
        if (newObs !== oldObs) {
          const mentions = newObs.match(/@\w+(?:\s\w+)*/g);
          const oldMentions = oldObs.match(/@\w+(?:\s\w+)*/g) || [];
          
          mentions?.forEach(async (mention) => {
            if (!oldMentions.includes(mention)) {
              const userName = mention.slice(1);
              const user = availableUsers.find(u => u.name === userName);
              if (user) {
                // Internal notification
                setNotifications(prev => [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    message: `${userName} foi citado no projeto ${updatedProject.name}: "${newAction.description}"`,
                    date: new Date().toISOString(),
                    read: false
                  },
                  ...prev
                ]);

                // Email notification
                try {
                  await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: user.email,
                      subject: `Você foi citado no projeto: ${updatedProject.name}`,
                      text: `Olá ${user.name},\n\nVocê foi citado em uma observação no projeto "${updatedProject.name}".\n\nAção: ${newAction.description}\nObservação: ${newObs}\n\nAtenciosamente,\nGestor de Projetos`
                    })
                  });
                } catch (error) {
                  console.error("Erro ao enviar e-mail:", error);
                }
              }
            }
          });
        }
      });
    }

    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === "Execução" || p.status === "Em Andamento").length,
    completed: projects.filter(p => p.status === "Finalizado" || p.status === "Concluído").length,
    pendingActions: projects.reduce((acc, p) => acc + p.actions.filter(a => !a.completionDate).length, 0)
  };

  const scrollToProject = (id: string) => {
    setIsProjectListModalOpen(false);
    setIsPendingActionsModalOpen(false);
    setFilterStatus('All');
    setSearchTerm("");
    setView('list');
    
    setTimeout(() => {
      const element = document.getElementById(`project-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-4');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <CheckCircle2 className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">Gestor de Projetos</h1>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Painel de Controle</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-3 hover:bg-gray-100 rounded-xl text-gray-500 transition-all relative"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setIsDataModalOpen(true)}
                  className="p-3 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                  title="Sincronizar Dados"
                >
                  <Database size={20} />
                </button>

                <button 
                  onClick={() => setIsTimeModalOpen(true)}
                  className="p-3 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                  title="Gestão de Horas"
                >
                  <Clock size={20} />
                </button>

                <button 
                  onClick={() => setIsTestForecastModalOpen(true)}
                  className="p-3 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                  title="Previsão de Testes"
                >
                  <FlaskConical size={20} />
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notificações</h3>
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          Marcar todas como lidas
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-gray-50 last:border-0 transition-colors ${n.read ? 'bg-white' : 'bg-indigo-50/30'}`}>
                              <p className="text-[11px] text-gray-700 font-medium mb-1">{n.message}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(n.date).toLocaleString('pt-BR')}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <Bell className="mx-auto text-gray-200 mb-2" size={32} />
                            <p className="text-xs text-gray-400 font-medium italic">Nenhuma notificação</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl mr-4">
                <button 
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ListTodo size={14} />
                  Lista
                </button>
                <button 
                  onClick={() => setView('stats')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${view === 'stats' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <BarChart3 size={14} />
                  Indicadores
                </button>
              </div>
              <button 
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-bold"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Novo Projeto</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Projetos', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: () => setIsProjectListModalOpen(true) },
            { label: 'Em Andamento', value: stats.inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => setFilterStatus(prev => prev === "Execução" ? 'All' : "Execução") },
            { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => setFilterStatus(prev => prev === "Finalizado" ? 'All' : "Finalizado") },
            { label: 'Ações Pendentes', value: stats.pendingActions, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => setIsPendingActionsModalOpen(true) },
          ].map((stat, i) => (
            <button 
              key={i} 
              onClick={stat.onClick}
              className={`bg-white p-6 rounded-3xl border shadow-sm text-left transition-all group ${
                (stat.label === 'Em Andamento' && (filterStatus === "Execução" || filterStatus === "Em Andamento")) ||
                (stat.label === 'Concluídos' && (filterStatus === "Finalizado" || filterStatus === "Concluído"))
                  ? 'border-indigo-500 ring-2 ring-indigo-50'
                  : 'border-gray-100 hover:shadow-md hover:border-indigo-100'
              }`}
            >
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Main Content */}
        {view === 'list' ? (
          <>
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, número ou líder..."
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <select 
                  className="flex-1 md:flex-none bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                  value={productLineFilter}
                  onChange={(e) => setProductLineFilter(e.target.value)}
                >
                  <option value="All">Todas as Linhas</option>
                  {productLines.map(line => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
                </select>
                <select 
                  className="flex-1 md:flex-none bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">Todos os Status</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsStatusModalOpen(true)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                  title="Gerenciar Status"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Project List */}
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      availableUsers={availableUsers}
                      timeAllocations={timeAllocations}
                      productLines={productLines}
                      userAvailabilities={userAvailabilities}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onUpdate={handleUpdateProject}
                      onUpdateTimeAllocation={setTimeAllocations}
                    />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200"
                  >
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="text-gray-300 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-gray-500">Tente ajustar seus filtros ou crie um novo projeto para começar.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <IndicatorsView 
            projects={projects} 
            availableUsers={availableUsers} 
            timeAllocations={timeAllocations}
            userAvailabilities={userAvailabilities}
            activityTypes={activityTypes}
          />
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProjectModal 
            project={editingProject} 
            availableUsers={availableUsers}
            availableStatuses={availableStatuses}
            productLines={productLines}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProject(null);
            }} 
            onSave={handleAddProject}
          />
        )}
        {isProjectListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProjectListModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Todos os Projetos</h2>
                <button onClick={() => setIsProjectListModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={24} /></button>
              </div>
              <div className="space-y-3">
                {projects.map(p => (
                  <button key={p.id} onClick={() => scrollToProject(p.id)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all text-left">
                    <div>
                      <p className="font-black text-gray-900">{p.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{p.number} • {p.status}</p>
                    </div>
                    <ArrowRight size={18} className="text-indigo-600" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {isPendingActionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPendingActionsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">Ações Pendentes</h2>
                <button onClick={() => setIsPendingActionsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={24} /></button>
              </div>
              <div className="space-y-3">
                {projects.flatMap(p => p.actions.filter(a => !a.completionDate).map(a => ({ ...a, projectName: p.name, projectId: p.id })))
                  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                  .map(a => (
                    <button key={a.id} onClick={() => scrollToProject(a.projectId)} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-amber-50 hover:border-amber-100 transition-all text-left">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate">{a.description}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Projeto: {a.projectName}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> {new Date(a.deadline).toLocaleDateString('pt-BR')}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><User size={10} /> {a.responsible}</span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-amber-600" />
                    </button>
                  ))}
                {stats.pendingActions === 0 && <p className="text-center py-10 text-gray-400 italic">Nenhuma ação pendente!</p>}
              </div>
            </motion.div>
          </div>
        )}
        {isStatusModalOpen && (
          <StatusModal 
            statuses={availableStatuses}
            onClose={() => setIsStatusModalOpen(false)}
            onSave={(newStatuses) => setAvailableStatuses(newStatuses)}
          />
        )}
        {isDataModalOpen && (
          <DataManagementModal 
            projects={projects}
            availableUsers={availableUsers}
            availableStatuses={availableStatuses}
            onClose={() => setIsDataModalOpen(false)}
            onImport={(data) => {
              if (data.projects) setProjects(data.projects);
              if (data.users) setAvailableUsers(data.users);
              if (data.statuses) setAvailableStatuses(data.statuses);
            }}
          />
        )}
        {isTimeModalOpen && (
          <TimeManagementModal 
            projects={projects}
            users={availableUsers}
            availabilities={userAvailabilities}
            allocations={timeAllocations}
            activityTypes={activityTypes}
            onClose={() => setIsTimeModalOpen(false)}
            onSaveAvailabilities={setUserAvailabilities}
            onSaveAllocations={setTimeAllocations}
            onSaveActivityTypes={setActivityTypes}
          />
        )}
        {isTestForecastModalOpen && (
          <TestForecastModal 
            projects={projects}
            availableUsers={availableUsers}
            productLines={productLines}
            forecastedTests={forecastedTests}
            productLineBudgets={productLineBudgets}
            productionLines={productionLines}
            onClose={() => setIsTestForecastModalOpen(false)}
            onSaveProductLines={setProductLines}
            onSaveProductionLines={setProductionLines}
            onSaveForecastedTests={setForecastedTests}
            onSaveBudgets={setProductLineBudgets}
            onUpdateProject={handleUpdateProject}
            onAddTimeAllocation={(allocation) => setTimeAllocations([...timeAllocations, allocation])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface IndicatorsViewProps {
  projects: Project[];
  availableUsers: UserType[];
  timeAllocations: TimeAllocation[];
  userAvailabilities: UserAvailability[];
  activityTypes: string[];
}

const IndicatorsView: React.FC<IndicatorsViewProps> = ({ projects, availableUsers, timeAllocations, userAvailabilities, activityTypes }) => {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  });

  // Data for Status Chart
  const statuses = Array.from(new Set(projects.map(p => p.status))).filter(Boolean);
  const statusData = statuses.map(status => ({
    name: status,
    value: projects.filter(p => p.status === status).length
  })).filter(d => d.value > 0);

  const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#6b7280'];

  // Data for Priority Chart
  const priorityData = Object.values(Priority).filter(v => typeof v === 'number').map(p => ({
    name: `P${p}`,
    value: projects.filter(proj => proj.priority === p).length
  }));

  // Data for Leader Chart
  const leaders = Array.from(new Set(projects.map(p => p.leader))).filter(Boolean);
  const leaderData = leaders.map(leader => ({
    name: leader,
    projetos: projects.filter(p => p.leader === leader).length,
    concluidos: projects.filter(p => p.leader === leader && (p.status === "Finalizado" || p.status === "Concluído")).length
  })).sort((a, b) => b.projetos - a.projetos);

  // Action Completion Rate
  const totalActions = projects.reduce((acc, p) => acc + p.actions.length, 0);
  const completedActions = projects.reduce((acc, p) => acc + p.actions.filter(a => a.completionDate).length, 0);
  const delayedActionsCount = projects.reduce((acc, p) => acc + p.actions.filter(a => {
    const deadline = new Date(a.deadline);
    const completion = a.completionDate ? new Date(a.completionDate) : null;
    const today = new Date();
    if (completion) return completion > deadline;
    return today > deadline;
  }).length, 0);
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Data for Team Table
  const teamStats = availableUsers.map(user => {
    const userProjects = projects.filter(p => p.team.includes(user.name) || p.leader === user.name || p.actions.some(a => a.responsible === user.name));
    const userActions = projects.reduce((acc, p) => acc + p.actions.filter(a => a.responsible === user.name).length, 0);
    return {
      name: user.name,
      projectsCount: userProjects.length,
      actionsCount: userActions
    };
  }).sort((a, b) => b.actionsCount - a.actionsCount);

  // Deadline Compliance Data
  const getCompliance = (deadlineField: keyof Project, extensionField: keyof Project) => {
    const relevantProjects = projects.filter(p => p[deadlineField]);
    if (relevantProjects.length === 0) return 0;
    
    const onTime = relevantProjects.filter(p => {
      const deadline = p[deadlineField] as string;
      const extension = p[extensionField] as string;
      
      // If there is an extension, it's NOT considered positive compliance (per user request)
      if (extension) return false;

      const isFinished = p.status === "Finalizado" || p.status === "Concluído";
      
      if (isFinished && p.completionDate) {
        return new Date(p.completionDate) <= new Date(deadline);
      }
      return new Date() <= new Date(deadline);
    }).length;
    
    return Math.round((onTime / relevantProjects.length) * 100);
  };

  const complianceData = [
    { name: 'Geral', value: getCompliance('overallDeadline', 'overallExtension') },
    { name: 'Estudo Técnico', value: getCompliance('techStudyDeadline', 'techStudyExtension') },
    { name: 'Execução', value: getCompliance('executionDeadline', 'executionExtension') }
  ];

  // Compliance by Leader
  const leaderComplianceData = leaders.map(leader => {
    const leaderProjects = projects.filter(p => p.leader === leader && p.overallDeadline);
    if (leaderProjects.length === 0) return { name: leader, value: 0 };
    
    const onTime = leaderProjects.filter(p => {
      // Exclude points for late or extended projects
      if (p.overallExtension) return false;
      
      const deadline = p.overallDeadline!;
      const isFinished = p.status === "Finalizado" || p.status === "Concluído";
      if (isFinished && p.completionDate) return new Date(p.completionDate) <= new Date(deadline);
      return new Date() <= new Date(deadline);
    }).length;
    
    return {
      name: leader,
      value: Math.round((onTime / leaderProjects.length) * 100)
    };
  }).sort((a, b) => b.value - a.value);

  const weeklyAllocationData = availableUsers.map(user => {
    const availability = userAvailabilities.find(a => a.userName === user.name)?.weeklyHours || 40;
    const allocations = timeAllocations.filter(a => a.userName === user.name && a.week === selectedWeek);
    const projectHours = allocations.filter(a => a.projectId).reduce((sum, a) => sum + a.hours, 0);
    const otherHours = allocations.filter(a => a.activityType).reduce((sum, a) => sum + a.hours, 0);
    const projectCount = Array.from(new Set(allocations.filter(a => a.projectId).map(a => a.projectId))).length;

    return {
      name: user.name,
      disponivel: availability,
      projetos: projectHours,
      outros: otherHours,
      projectCount
    };
  });

  const yearlyHistoryData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const year = new Date().getFullYear();
    
    const getMonthFromWeek = (weekStr: string) => {
      const [y, w] = weekStr.split('-W');
      const d = new Date(parseInt(y), 0, 1);
      d.setDate(d.getDate() + (parseInt(w) - 1) * 7);
      return d.getMonth() + 1;
    };

    const yearAllocations = timeAllocations.filter(a => a.week.startsWith(year.toString()));
    const monthAllocations = yearAllocations.filter(a => getMonthFromWeek(a.week) === month);
    const projectHours = monthAllocations.filter(a => a.projectId).reduce((sum, a) => sum + a.hours, 0);
    const otherHours = monthAllocations.filter(a => a.activityType).reduce((sum, a) => sum + a.hours, 0);

    return {
      name: new Date(year, i).toLocaleDateString('pt-BR', { month: 'short' }),
      projetos: projectHours,
      outros: otherHours,
      total: projectHours + otherHours
    };
  });

  // Gantt Chart Data
  const minDate = projects.length > 0 
    ? new Date(Math.min(...projects.map(proj => new Date(proj.openingDate).getTime()))).getTime()
    : new Date().getTime();
  const refDate = minDate;
  const dayMs = 24 * 60 * 60 * 1000;

  const ganttData = projects.map(p => {
    const getDays = (dateStr?: string) => {
      if (!dateStr) return null;
      return Math.floor((new Date(dateStr).getTime() - refDate) / dayMs);
    };

    const openingStart = getDays(p.openingDate) || 0;
    const openingDeadline = Math.max(openingStart, getDays(p.overallDeadline) || (openingStart + 7));
    const openingEnd = Math.max(openingDeadline, getDays(p.overallExtension || p.overallDeadline) || openingDeadline);
    
    const techStart = Math.max(openingEnd, getDays(p.techStudyStart) || openingEnd);
    const techDeadline = Math.max(techStart, getDays(p.techStudyDeadline) || (techStart + 14));
    const techEnd = Math.max(techDeadline, getDays(p.techStudyExtension || p.techStudyDeadline) || techDeadline);
    
    const execStart = Math.max(techEnd, getDays(p.executionStart) || techEnd);
    const execDeadline = Math.max(execStart, getDays(p.executionDeadline) || (execStart + 30));
    const execEnd = Math.max(execDeadline, getDays(p.executionExtension || p.executionDeadline) || execDeadline);

    const isDelayed = (deadline: string, extension?: string) => {
      if (!deadline) return false;
      const final = extension || deadline;
      return new Date() > new Date(final) && p.status !== "Finalizado" && p.status !== "Concluído";
    };

    const baseData = {
      priority: p.priority,
      deadlineDate: p.overallDeadline ? new Date(p.overallDeadline).getTime() : Infinity,
      hasExtensions: !!(p.overallExtension || p.techStudyExtension || p.executionExtension),
    };

    return [
      {
        ...baseData,
        name: `${p.name} (Total)`,
        type: 'total',
        range: [openingStart, openingEnd],
        ext: openingEnd > openingDeadline ? [openingDeadline, openingEnd] : null,
        delayed: isDelayed(p.overallDeadline, p.overallExtension),
        label: `${p.openingDate} -> ${p.overallDeadline}${p.overallExtension ? ` (Prorrogado: ${p.overallExtension})` : ''}`
      },
      {
        ...baseData,
        name: `${p.name} (Estudo)`,
        type: 'tech',
        range: [techStart, techEnd],
        ext: (p.techStudyDeadline && techEnd > techDeadline) ? [techDeadline, techEnd] : null,
        delayed: isDelayed(p.techStudyDeadline || "", p.techStudyExtension),
        label: p.techStudyStart ? `${p.techStudyStart} -> ${p.techStudyDeadline}${p.techStudyExtension ? ` (Prorrogado: ${p.techStudyExtension})` : ''}` : 'N/A'
      },
      {
        ...baseData,
        name: `${p.name} (Execução)`,
        type: 'exec',
        range: [execStart, execEnd],
        ext: (p.executionDeadline && execEnd > execDeadline) ? [execDeadline, execEnd] : null,
        delayed: isDelayed(p.executionDeadline || "", p.executionExtension),
        label: p.executionStart ? `${p.executionStart} -> ${p.executionDeadline}${p.executionExtension ? ` (Prorrogado: ${p.executionExtension})` : ''}` : 'N/A'
      }
    ];
  }).flat().sort((a, b) => a.deadlineDate - b.deadlineDate);

  const formatDateTick = (days: number) => {
    const date = new Date(refDate + days * dayMs);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Distribuição por Status</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Projetos por Prioridade</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Carga de Trabalho por Pessoa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                  <th className="text-center py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projetos Ativos</th>
                  <th className="text-center py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total de Ações</th>
                  <th className="text-right py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Intensidade</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((stat, idx) => (
                  <tr key={stat.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {stat.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{stat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center text-sm font-black text-gray-900">{stat.projectsCount}</td>
                    <td className="py-4 text-center text-sm font-black text-gray-900">{stat.actionsCount}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.min(100, (stat.actionsCount / (totalActions || 1)) * 500)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deadline Compliance Charts */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Atendimento aos Prazos</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} unit="%" tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [`${value}%`, 'Atendimento']} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 80 ? '#10b981' : entry.value >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance by Leader */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Atendimento por Líder</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderComplianceData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [`${value}%`, 'Atendimento']} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {leaderComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 80 ? '#8b5cf6' : entry.value >= 50 ? '#a78bfa' : '#c4b5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leader Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Desempenho por Líder</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="projetos" name="Total Projetos" fill="#6366f1" radius={[0, 8, 8, 0]} />
                <Bar dataKey="concluidos" name="Concluídos" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Allocation Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                <Clock size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900">Alocação de Horas por Semana</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Semana:</span>
              <input 
                type="week" 
                className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              />
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAllocationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} unit="h" tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="disponivel" name="Disponível" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                <Bar dataKey="projetos" name="Projetos" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outros" name="Outras Atividades" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly History Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Histórico Anual de Horas</h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} unit="h" tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="projetos" name="Projetos" stackId="a" fill="#6366f1" />
                <Bar dataKey="outros" name="Outras Atividades" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Completion Rate Card */}
        <div className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white flex flex-col items-center justify-center text-center lg:col-span-2">
          <div className="bg-white/20 p-4 rounded-2xl mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2">Taxa de Conclusão de Ações</h3>
          <p className="text-indigo-100 font-medium mb-8">Progresso geral de todas as tarefas cadastradas</p>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - completionRate / 100)}
                className="text-white transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{completionRate}%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Concluído</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-12 mt-10 w-full max-w-md">
            <div>
              <p className="text-3xl font-black">{completedActions}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Ações Finalizadas</p>
            </div>
            <div>
              <p className="text-3xl font-black text-red-300">{delayedActionsCount}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Ações Atrasadas</p>
            </div>
            <div>
              <p className="text-3xl font-black">{totalActions - completedActions}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Ações Pendentes</p>
            </div>
          </div>
        </div>

        {/* Gantt Chart / Chronogram */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900">Cronograma Geral (Gantt)</h3>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Abertura</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Estudo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Execução</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Prorrogação</span>
              </div>
            </div>
          </div>
          
          <div className="h-[600px] w-full overflow-y-auto">
            <ResponsiveContainer width="100%" height={Math.max(500, ganttData.length * 35)}>
              <BarChart
                data={ganttData}
                layout="vertical"
                margin={{ left: 150, right: 30, top: 20, bottom: 40 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis 
                  type="number" 
                  domain={['dataMin', 'dataMax + 7']} 
                  tickFormatter={formatDateTick}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const item = ganttData.find(d => d.name === payload.value);
                    const isSubTask = payload.value.includes('(');
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={-10} y={0} dy={-4} textAnchor="end" fill={isSubTask ? "#6b7280" : "#1f2937"} fontSize={isSubTask ? 8 : 10} fontWeight={isSubTask ? 600 : 900}>
                          {payload.value}
                        </text>
                        {!isSubTask && (
                          <text x={-10} y={0} dy={8} textAnchor="end" fill={item?.priority === 1 ? '#ef4444' : item?.priority === 2 ? '#f59e0b' : '#3b82f6'} fontSize={9} fontWeight={800}>
                            PRIORIDADE P{item?.priority}
                          </text>
                        )}
                      </g>
                    );
                  }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <p className="font-black text-gray-900">{data.name}</p>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white ${data.priority === 1 ? 'bg-red-500' : data.priority === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}>P{data.priority}</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className={`text-[10px] font-black uppercase flex items-center gap-2 ${data.type === 'total' ? 'text-indigo-600' : data.type === 'tech' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {data.type === 'total' ? 'Total' : data.type === 'tech' ? 'Estudo' : 'Execução'}: {data.label}
                                {data.delayed && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[8px]">ATRASADO</span>}
                              </p>
                            </div>
                            {data.hasExtensions && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[9px] font-bold text-gray-400 italic">Este projeto possui prorrogações de prazo.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ paddingBottom: 20 }}
                  payload={[
                    { value: 'Abertura', type: 'rect', color: '#6366f1' },
                    { value: 'Estudo', type: 'rect', color: '#10b981' },
                    { value: 'Execução', type: 'rect', color: '#f59e0b' },
                    { value: 'Prorrogação', type: 'rect', color: '#ef4444' }
                  ]}
                />
                
                {/* Gantt Bars */}
                <Bar dataKey="range" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={20} name="Período">
                  {ganttData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.type === 'total' ? '#6366f1' : entry.type === 'tech' ? '#10b981' : '#f59e0b'} 
                    />
                  ))}
                </Bar>
                <Bar dataKey="ext" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={20} name="Prorrogação" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface TestForecastModalProps {
  projects: Project[];
  availableUsers: UserType[];
  productLines: ProductLine[];
  productionLines: ProductionLine[];
  forecastedTests: ForecastedTest[];
  productLineBudgets: ProductLineBudget[];
  onClose: () => void;
  onSaveProductLines: (lines: ProductLine[]) => void;
  onSaveProductionLines: (lines: ProductionLine[]) => void;
  onSaveForecastedTests: (tests: ForecastedTest[]) => void;
  onSaveBudgets: (budgets: ProductLineBudget[]) => void;
  onUpdateProject: (project: Project) => void;
  onAddTimeAllocation: (allocation: TimeAllocation) => void;
}

const TestForecastModal: React.FC<TestForecastModalProps> = ({ 
  projects, 
  availableUsers, 
  productLines, 
  productionLines,
  forecastedTests, 
  productLineBudgets,
  onClose, 
  onSaveProductLines, 
  onSaveProductionLines,
  onSaveForecastedTests,
  onSaveBudgets,
  onUpdateProject,
  onAddTimeAllocation
}) => {
  const [activeTab, setActiveTab] = useState<'lines' | 'registration' | 'table' | 'budget'>('table');
  const [newLine, setNewLine] = useState("");
  const [newProductionLine, setNewProductionLine] = useState("");
  const [newBudget, setNewBudget] = useState<Partial<ProductLineBudget>>({
    productLineId: "",
    month: new Date().toISOString().slice(0, 7),
    budgetedHours: 0,
    extraHours: 0,
    extraHoursJustification: "",
    extraHoursObservation: ""
  });
  const [newTest, setNewTest] = useState<Partial<ForecastedTest>>({
    productLineId: "",
    productionLineId: "",
    projectId: "",
    forecastMonth: new Date().toISOString().slice(0, 7),
    description: "",
    programmedTime: 0,
    complexity: 'Média',
    responsible: "",
    observation: "",
    needsPreTestMeeting: false,
    needsPostTestMeeting: false,
    status: 'Não Programado'
  });

  const [budgetFilterLine, setBudgetFilterLine] = useState<string | 'All'>('All');
  const [budgetFilterMonth, setBudgetFilterMonth] = useState<string>("");
  const [tableFilters, setTableFilters] = useState({
    month: "",
    line: "All",
    project: "All",
    status: "All"
  });

  const handleAddLine = () => {
    if (newLine.trim()) {
      onSaveProductLines([...productLines, { id: Math.random().toString(36).substr(2, 9), name: newLine.trim() }]);
      setNewLine("");
    }
  };

  const handleAddProductionLine = () => {
    if (newProductionLine.trim()) {
      onSaveProductionLines([...productionLines, { id: Math.random().toString(36).substr(2, 9), name: newProductionLine.trim() }]);
      setNewProductionLine("");
    }
  };

  const handleDeleteLine = (id: string) => {
    onSaveProductLines(productLines.filter(l => l.id !== id));
  };

  const handleDeleteProductionLine = (id: string) => {
    onSaveProductionLines(productionLines.filter(l => l.id !== id));
  };

  const handleAddTest = () => {
    if (!newTest.productLineId) {
      alert("Por favor, selecione uma Linha de Produto.");
      return;
    }
    if (!newTest.projectId) {
      alert("Por favor, selecione um Projeto.");
      return;
    }
    if (!newTest.forecastMonth) {
      alert("Por favor, selecione o Mês Previsto.");
      return;
    }
    if (!newTest.description) {
      alert("Por favor, insira uma Descrição do Teste.");
      return;
    }

    const budget = productLineBudgets.find(b => b.productLineId === newTest.productLineId && b.month === newTest.forecastMonth);
    const totalBudgeted = (budget?.budgetedHours || 0) + (budget?.extraHours || 0);
    const alreadyProgrammed = forecastedTests
      .filter(t => t.productLineId === newTest.productLineId && t.forecastMonth === newTest.forecastMonth)
      .reduce((acc, t) => acc + t.programmedTime, 0);

    if (alreadyProgrammed + (newTest.programmedTime || 0) > totalBudgeted) {
      alert(`Erro: O tempo programado excede o orçamento disponível para esta linha no mês selecionado. (Disponível: ${totalBudgeted - alreadyProgrammed}h)`);
      return;
    }

    const test: ForecastedTest = {
      id: Math.random().toString(36).substr(2, 9),
      productLineId: newTest.productLineId,
      projectId: newTest.projectId,
      forecastMonth: newTest.forecastMonth,
      description: newTest.description,
      programmedTime: newTest.programmedTime || 0,
      complexity: newTest.complexity as any,
      responsible: newTest.responsible || "",
      observation: newTest.observation || "",
      needsPreTestMeeting: false,
      needsPostTestMeeting: false,
      status: 'Não Programado'
    };
    onSaveForecastedTests([...forecastedTests, test]);
    setNewTest({
      ...newTest,
      description: "",
      programmedTime: 0,
      observation: ""
    });
    alert("Teste cadastrado com sucesso!");
  };

  const handleDeleteTest = (id: string) => {
    onSaveForecastedTests(forecastedTests.filter(t => t.id !== id));
  };

  const handleUpdateTest = (id: string, updates: Partial<ForecastedTest>) => {
    const test = forecastedTests.find(t => t.id === id);
    if (!test) return;

    // Handle rescheduling justification
    if (updates.forecastMonth && updates.forecastMonth !== test.forecastMonth) {
      const justification = prompt("Justificativa para alteração do mês previsto:");
      if (!justification) {
        alert("A justificativa é obrigatória para reagendar o teste.");
        return;
      }
      updates.originalForecastMonth = test.originalForecastMonth || test.forecastMonth;
      updates.rescheduleJustification = justification;
    }

    // Automatic actions when scheduledDate is set
    if (updates.scheduledDate && updates.scheduledDate !== test.scheduledDate) {
      const project = projects.find(p => p.id === test.projectId);
      if (project) {
        const newAction: ProjectAction = {
          id: Math.random().toString(36).substr(2, 9),
          description: `Teste: ${test.description}`,
          responsible: updates.executionResponsible || test.executionResponsible || test.responsible,
          deadline: updates.scheduledDate,
          stage: 'Execução'
        };
        onUpdateProject({
          ...project,
          actions: [...project.actions, newAction]
        });

        // Add time allocation
        const getWeekFromDate = (dateStr: string) => {
          const date = new Date(dateStr);
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
          const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
          return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        };

        onAddTimeAllocation({
          id: Math.random().toString(36).substr(2, 9),
          userName: updates.executionResponsible || test.executionResponsible || test.responsible,
          projectId: test.projectId,
          hours: test.programmedTime,
          week: getWeekFromDate(updates.scheduledDate)
        });
      }
    }

    onSaveForecastedTests(forecastedTests.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddBudget = () => {
    if (newBudget.productLineId && newBudget.month && newBudget.budgetedHours !== undefined) {
      onSaveBudgets([...productLineBudgets, { 
        id: Math.random().toString(36).substr(2, 9), 
        productLineId: newBudget.productLineId,
        month: newBudget.month,
        budgetedHours: newBudget.budgetedHours,
        extraHours: newBudget.extraHours || 0,
        extraHoursJustification: newBudget.extraHoursJustification || "",
        extraHoursObservation: newBudget.extraHoursObservation || ""
      }]);
      setNewBudget({ 
        ...newBudget, 
        budgetedHours: 0, 
        extraHours: 0, 
        extraHoursJustification: "", 
        extraHoursObservation: "" 
      });
    }
  };

  const handleDeleteBudget = (id: string) => {
    onSaveBudgets(productLineBudgets.filter(b => b.id !== id));
  };

  const handleExportTests = () => {
    const data = sortedTests.map(t => ({
      'Mês Previsto': t.forecastMonth,
      'Linha de Produto': productLines.find(l => l.id === t.productLineId)?.name,
      'Projeto': projects.find(p => p.id === t.projectId)?.name,
      'Descrição': t.description,
      'Tempo Programado (h)': t.programmedTime,
      'Complexidade': t.complexity,
      'Responsável': t.responsible,
      'Data Agendada': t.scheduledDate,
      'Responsável Execução': t.executionResponsible,
      'Reunião Pré': t.needsPreTestMeeting ? 'Sim' : 'Não',
      'Reunião Pós': t.needsPostTestMeeting ? 'Sim' : 'Não',
      'Data Conclusão': t.completionDate,
      'Observações': t.observation
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Previsão de Testes");
    XLSX.writeFile(wb, `Previsao_Testes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const sortedTests = [...forecastedTests].sort((a, b) => {
    if (a.forecastMonth !== b.forecastMonth) return a.forecastMonth.localeCompare(b.forecastMonth);
    const lineA = productLines.find(l => l.id === a.productLineId)?.name || "";
    const lineB = productLines.find(l => l.id === b.productLineId)?.name || "";
    return lineA.localeCompare(lineB);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <FlaskConical size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Previsão de Testes</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gestão de ensaios e laboratório</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportTests}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Exportar Lista
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="flex bg-gray-50 p-1 mx-8 mt-4 rounded-xl self-start">
          <button onClick={() => setActiveTab('lines')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'lines' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Linhas de Produto/Produção</button>
          <button onClick={() => setActiveTab('budget')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'budget' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Orçamento de Horas</button>
          <button onClick={() => setActiveTab('registration')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'registration' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Cadastro de Teste</button>
          <button onClick={() => setActiveTab('table')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tabela de Testes</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'budget' && (
            <div className="max-w-5xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Orçamento de Horas</h3>
                <div className="flex gap-4">
                  <div className="bg-indigo-50 px-4 py-2 rounded-xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Anual (Programado)</p>
                    <p className="text-lg font-black text-indigo-600">
                      {forecastedTests.reduce((acc, t) => acc + t.programmedTime, 0)}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Annual Summary per Line */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {productLines.map(line => {
                  const lineTests = forecastedTests.filter(t => t.productLineId === line.id);
                  const totalHours = lineTests.reduce((acc, t) => acc + t.programmedTime, 0);
                  const lineBudgets = productLineBudgets.filter(b => b.productLineId === line.id);
                  const totalBudget = lineBudgets.reduce((acc, b) => acc + (b.budgetedHours || 0) + (b.extraHours || 0), 0);
                  
                  return (
                    <div key={line.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{line.name}</p>
                      <div className="flex justify-between items-end">
                        <p className="text-lg font-black text-gray-900">{totalHours}h</p>
                        <p className="text-[10px] font-bold text-gray-400">Meta: {totalBudget}h</p>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${totalHours > totalBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, (totalHours / (totalBudget || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Novo Lançamento / Horas Extras</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Linha</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.productLineId}
                      onChange={(e) => setNewBudget({ ...newBudget, productLineId: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {productLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês</label>
                    <input 
                      type="month" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.month}
                      onChange={(e) => setNewBudget({ ...newBudget, month: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Horas Orçadas</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.budgetedHours}
                      onChange={(e) => setNewBudget({ ...newBudget, budgetedHours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Horas Extras (Concessão)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.extraHours}
                      onChange={(e) => setNewBudget({ ...newBudget, extraHours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Justificativa Horas Extras</label>
                    <input 
                      type="text" 
                      placeholder="Por que estas horas extras são necessárias?"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.extraHoursJustification}
                      onChange={(e) => setNewBudget({ ...newBudget, extraHoursJustification: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Observações</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newBudget.extraHoursObservation}
                      onChange={(e) => setNewBudget({ ...newBudget, extraHoursObservation: e.target.value })}
                    />
                    <button 
                      onClick={handleAddBudget} 
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
                    >
                      Salvar Orçamento
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Filtrar por Linha</label>
                  <select 
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={budgetFilterLine}
                    onChange={(e) => setBudgetFilterLine(e.target.value)}
                  >
                    <option value="All">Todas as Linhas</option>
                    {productLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Filtrar por Mês</label>
                  <input 
                    type="month" 
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={budgetFilterMonth}
                    onChange={(e) => setBudgetFilterMonth(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => { setBudgetFilterLine('All'); setBudgetFilterMonth(''); }}
                  className="px-4 py-2 text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-3">
                {productLineBudgets
                  .filter(b => (budgetFilterLine === 'All' || b.productLineId === budgetFilterLine) && (!budgetFilterMonth || b.month === budgetFilterMonth))
                  .sort((a,b) => b.month.localeCompare(a.month))
                  .map(budget => (
                    <div key={budget.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-xs">{budget.month}</span>
                          <span className="font-black text-gray-900">{productLines.find(l => l.id === budget.productLineId)?.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orçado</p>
                            <p className="font-black text-gray-900">{budget.budgetedHours}h</p>
                          </div>
                          {budget.extraHours ? (
                            <div className="text-right">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Extra</p>
                              <p className="font-black text-emerald-600">+{budget.extraHours}h</p>
                            </div>
                          ) : null}
                          <button onClick={() => handleDeleteBudget(budget.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {(budget.extraHoursJustification || budget.extraHoursObservation) && (
                        <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-4">
                          {budget.extraHoursJustification && (
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Justificativa</p>
                              <p className="text-xs font-bold text-gray-600 italic">"{budget.extraHoursJustification}"</p>
                            </div>
                          )}
                          {budget.extraHoursObservation && (
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Observações</p>
                              <p className="text-xs font-bold text-gray-600">{budget.extraHoursObservation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
          {activeTab === 'lines' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-black mb-4">Gerenciar Linhas de Produto</h3>
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Nome da linha..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                  />
                  <button onClick={handleAddLine} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center gap-2">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {productLines.map(line => (
                    <div key={line.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700">{line.name}</span>
                      <button onClick={() => handleDeleteLine(line.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black mb-4">Gerenciar Linhas de Produção</h3>
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Nome da linha de produção..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newProductionLine}
                    onChange={(e) => setNewProductionLine(e.target.value)}
                  />
                  <button onClick={handleAddProductionLine} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center gap-2">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {productionLines.map(line => (
                    <div key={line.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700">{line.name}</span>
                      <button onClick={() => handleDeleteProductionLine(line.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-black mb-4">Novo Teste</h3>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Linha de Produto</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newTest.productLineId}
                    onChange={(e) => setNewTest({ ...newTest, productLineId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {productLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Linha de Produção</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newTest.productionLineId}
                    onChange={(e) => setNewTest({ ...newTest, productionLineId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {productionLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Projeto</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newTest.projectId}
                    onChange={(e) => setNewTest({ ...newTest, projectId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês Previsto</label>
                  <input 
                    type="month" 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newTest.forecastMonth}
                    onChange={(e) => setNewTest({ ...newTest, forecastMonth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descrição do Teste</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm min-h-[100px]"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8" /> {/* Spacer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tempo Programado (h)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newTest.programmedTime}
                      onChange={(e) => setNewTest({ ...newTest, programmedTime: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Complexidade</label>
                    <select 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                      value={newTest.complexity}
                      onChange={(e) => setNewTest({ ...newTest, complexity: e.target.value as any })}
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Responsável</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={newTest.responsible}
                    onChange={(e) => setNewTest({ ...newTest, responsible: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {availableUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Observações</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm min-h-[60px]"
                    value={newTest.observation}
                    onChange={(e) => setNewTest({ ...newTest, observation: e.target.value })}
                  />
                </div>
                <button onClick={handleAddTest} className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                  Cadastrar Teste
                </button>
              </div>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Tabela de Testes</h3>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 px-6 py-3 rounded-2xl text-white shadow-lg shadow-indigo-100 flex items-center gap-3">
                    <TrendingUp size={20} />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Total Anual Orçado</p>
                      <p className="text-lg font-black leading-none">
                        {forecastedTests.reduce((acc, t) => acc + t.programmedTime, 0)}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {productLines.map(line => {
                  const months = Array.from(new Set(forecastedTests.map(t => t.forecastMonth))).sort();
                  return months.map(month => {
                    const allocated = forecastedTests
                      .filter(t => t.productLineId === line.id && t.forecastMonth === month)
                      .reduce((acc, t) => acc + t.programmedTime, 0);
                    const budget = productLineBudgets.find(b => b.productLineId === line.id && b.month === month);
                    const budgeted = (budget?.budgetedHours || 0) + (budget?.extraHours || 0);
                    const available = budgeted - allocated;

                    if (budgeted === 0 && allocated === 0) return null;

                    return (
                      <div key={`${line.id}-${month}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{month}</p>
                            <p className="text-sm font-black text-gray-900">{line.name}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${available < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {available}h disponíveis
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                              <span className="text-gray-400">Alocado: {allocated}h</span>
                              <span className="text-gray-400">Orçado: {budgeted}h</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${allocated > budgeted ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, (allocated / (budgeted || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>

              {/* Table Filters */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês</label>
                  <input 
                    type="month" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold"
                    value={tableFilters.month}
                    onChange={(e) => setTableFilters({ ...tableFilters, month: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Linha de Produto</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold"
                    value={tableFilters.line}
                    onChange={(e) => setTableFilters({ ...tableFilters, line: e.target.value })}
                  >
                    <option value="All">Todas</option>
                    {productLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Projeto</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold"
                    value={tableFilters.project}
                    onChange={(e) => setTableFilters({ ...tableFilters, project: e.target.value })}
                  >
                    <option value="All">Todos</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold"
                    value={tableFilters.status}
                    onChange={(e) => setTableFilters({ ...tableFilters, status: e.target.value })}
                  >
                    <option value="All">Todos</option>
                    <option value="Não Programado">Não Programado</option>
                    <option value="Execução Agendada">Execução Agendada</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1600px]">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mês Previsto</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Linha Produto</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Linha Produção</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Projeto</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo Prog.</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo Real</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Compl.</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Resp.</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Agendada</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Resp. Exec.</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Reuniões</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Conclusão</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Obs.</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedTests
                      .filter(t => (
                        (!tableFilters.month || t.forecastMonth === tableFilters.month) &&
                        (tableFilters.line === 'All' || t.productLineId === tableFilters.line) &&
                        (tableFilters.project === 'All' || t.projectId === tableFilters.project) &&
                        (tableFilters.status === 'All' || t.status === tableFilters.status)
                      ))
                      .map(test => {
                      const isRescheduled = !!test.rescheduleJustification;
                      return (
                        <tr key={test.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="relative group/tooltip">
                              <input 
                                type="month" 
                                className={`bg-transparent border-none font-black text-xs outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 ${isRescheduled ? 'text-orange-600' : 'text-indigo-600'}`}
                                value={test.forecastMonth}
                                onChange={(e) => handleUpdateTest(test.id, { forecastMonth: e.target.value })}
                              />
                              {isRescheduled && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50">
                                  <div className="bg-gray-900 text-white text-[10px] p-2 rounded-lg shadow-xl min-w-[200px]">
                                    <p className="font-black uppercase tracking-widest text-orange-400 mb-1">Reagendado</p>
                                    <p className="font-bold mb-1">Original: {test.originalForecastMonth}</p>
                                    <p className="italic text-gray-300">"{test.rescheduleJustification}"</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-600">{productLines.find(l => l.id === test.productLineId)?.name}</td>
                          <td className="px-4 py-3 text-xs font-bold text-gray-600">{productionLines.find(l => l.id === test.productionLineId)?.name || "-"}</td>
                          <td className="px-4 py-3 text-xs font-bold text-indigo-600">{projects.find(p => p.id === test.projectId)?.name}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-700 max-w-xs truncate" title={test.description}>{test.description}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-gray-900">{test.programmedTime}h</td>
                          <td className="px-4 py-3 text-center">
                            <select 
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border outline-none ${
                                test.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                test.status === 'Execução Agendada' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-gray-50 text-gray-500 border-gray-100'
                              }`}
                              value={test.status}
                              onChange={(e) => handleUpdateTest(test.id, { status: e.target.value as any })}
                            >
                              <option value="Não Programado">Não Programado</option>
                              <option value="Execução Agendada">Execução Agendada</option>
                              <option value="Finalizado">Finalizado</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="number" 
                              className="w-16 bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-xs font-bold text-center"
                              value={test.realTimePerformed || ""}
                              onChange={(e) => handleUpdateTest(test.id, { realTimePerformed: parseFloat(e.target.value) || 0 })}
                              placeholder="-"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${test.complexity === 'Alta' ? 'bg-red-50 text-red-600' : test.complexity === 'Média' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {test.complexity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              className="bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-[11px] font-bold w-full"
                              value={test.responsible || ""}
                              onChange={(e) => handleUpdateTest(test.id, { responsible: e.target.value })}
                            >
                              <option value="">Selecione...</option>
                              {availableUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="date" 
                              className="bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-[11px] font-bold"
                              value={test.scheduledDate || ""}
                              onChange={(e) => handleUpdateTest(test.id, { scheduledDate: e.target.value, status: 'Execução Agendada' })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              className="bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-[11px] font-bold w-full"
                              value={test.executionResponsible || ""}
                              onChange={(e) => handleUpdateTest(test.id, { executionResponsible: e.target.value })}
                            >
                              <option value="">Selecione...</option>
                              {availableUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleUpdateTest(test.id, { needsPreTestMeeting: !test.needsPreTestMeeting })}
                                className={`p-1 rounded ${test.needsPreTestMeeting ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
                                title="Reunião Pré"
                              >
                                <Users size={12} />
                              </button>
                              <button 
                                onClick={() => handleUpdateTest(test.id, { needsPostTestMeeting: !test.needsPostTestMeeting })}
                                className={`p-1 rounded ${test.needsPostTestMeeting ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                                title="Reunião Pós"
                              >
                                <Users size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="date" 
                              className="bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-[11px] font-bold"
                              value={test.completionDate || ""}
                              onChange={(e) => handleUpdateTest(test.id, { completionDate: e.target.value, status: 'Finalizado' })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="text" 
                              className="bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none text-[11px] font-medium w-full"
                              value={test.observation || ""}
                              onChange={(e) => handleUpdateTest(test.id, { observation: e.target.value })}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteTest(test.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  availableUsers: UserType[];
  timeAllocations: TimeAllocation[];
  productLines: ProductLine[];
  userAvailabilities: UserAvailability[];
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onUpdate: (p: Project) => void;
  onUpdateTimeAllocation: (allocations: TimeAllocation[]) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, availableUsers, timeAllocations, productLines, userAvailabilities, onEdit, onDelete, onUpdate, onUpdateTimeAllocation }) => {
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newAction, setNewAction] = useState<Partial<ProjectAction>>({
    description: "",
    responsible: "",
    deadline: "",
    observation: "",
    stage: "Estudo Técnico",
  });
  const [mentionState, setMentionState] = useState<{
    actionId: string;
    query: string;
    visible: boolean;
  }>({ actionId: "", query: "", visible: false });

  const priorityColors = {
    [Priority.P1]: "bg-red-500 text-white border-red-500",
    [Priority.P2]: "bg-orange-500 text-white border-orange-500",
    [Priority.P3]: "bg-blue-500 text-white border-blue-500",
    [Priority.P4]: "bg-gray-500 text-white border-gray-500",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Execução": "bg-blue-50 text-blue-700 border-blue-100",
      "Não Iniciado": "bg-purple-50 text-purple-700 border-purple-100",
      "Finalizado": "bg-emerald-50 text-emerald-700 border-emerald-100",
      "Stand By": "bg-amber-50 text-amber-700 border-amber-100",
      "Em Andamento": "bg-blue-50 text-blue-700 border-blue-100",
      "Planejamento": "bg-purple-50 text-purple-700 border-purple-100",
      "Pausado": "bg-amber-50 text-amber-700 border-amber-100",
      "Concluído": "bg-emerald-50 text-emerald-700 border-emerald-100",
      "Cancelado": "bg-gray-50 text-gray-700 border-gray-100",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  const completedActions = project.actions.filter(a => a.completionDate).length;
  const totalActions = project.actions.length;
  const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  const techActions = project.actions.filter(a => a.stage === 'Estudo Técnico');
  const execActions = project.actions.filter(a => a.stage === 'Execução');

  const techProgress = techActions.length > 0 ? (techActions.filter(a => a.completionDate).length / techActions.length) * 100 : 0;
  const execProgress = execActions.length > 0 ? (execActions.filter(a => a.completionDate).length / execActions.length) * 100 : 0;

  const getDeadlineStatus = () => {
    const isFinished = project.status === "Finalizado" || project.status === "Concluído";
    if (isFinished) return { label: "Concluído", color: "bg-emerald-100 text-emerald-700" };

    const statusLower = project.status.toLowerCase();
    let finalDeadline = project.overallExtension || project.overallDeadline;
    let hasExtension = !!project.overallExtension;

    if (statusLower.includes("estudo") || statusLower.includes("técnico")) {
      finalDeadline = project.techStudyExtension || project.techStudyDeadline || finalDeadline;
      hasExtension = !!project.techStudyExtension;
    } else if (statusLower.includes("execução")) {
      finalDeadline = project.executionExtension || project.executionDeadline || finalDeadline;
      hasExtension = !!project.executionExtension;
    }

    if (!finalDeadline) return { label: "Sem Prazo", color: "bg-gray-100 text-gray-500" };
    
    const today = new Date();
    const deadlineDate = new Date(finalDeadline);
    
    if (today > deadlineDate) return { label: "Atrasado", color: "bg-red-100 text-red-700" };
    if (hasExtension) return { label: "Prorrogado", color: "bg-amber-100 text-amber-700" };
    return { label: "No Prazo", color: "bg-blue-100 text-blue-700" };
  };

  const deadlineStatus = getDeadlineStatus();

  const getCurrentWeek = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  };

  const getActionStatus = (action: ProjectAction) => {
    const deadline = new Date(action.deadline);
    const completion = action.completionDate ? new Date(action.completionDate) : null;
    const today = new Date();
    
    if (completion) {
      return completion <= deadline ? 'on-time' : 'delayed';
    }
    return today <= deadline ? 'on-time' : 'delayed';
  };

  const handleToggleAction = (actionId: string, isChecked: boolean) => {
    const updatedActions = project.actions.map(a => 
      a.id === actionId 
        ? { ...a, completionDate: isChecked ? new Date().toISOString() : undefined } 
        : a
    );
    onUpdate({ ...project, actions: updatedActions });
  };

  const handleAddAction = () => {
    if (newAction.description && newAction.responsible && newAction.deadline && newAction.stage) {
      const action: ProjectAction = {
        id: Math.random().toString(36).substr(2, 9),
        description: newAction.description,
        responsible: newAction.responsible,
        deadline: newAction.deadline,
        observation: newAction.observation || "",
        stage: newAction.stage as 'Estudo Técnico' | 'Execução',
      };
      onUpdate({
        ...project,
        actions: [...project.actions, action]
      });
      setNewAction({ description: "", responsible: "", deadline: "", observation: "", stage: "Estudo Técnico" });
      setIsAddingAction(false);
    }
  };

  const handleUpdateActionObservation = (actionId: string, observation: string) => {
    const updatedActions = project.actions.map(a => 
      a.id === actionId ? { ...a, observation } : a
    );
    onUpdate({ ...project, actions: updatedActions });

    // Mention logic
    const lastAtIndex = observation.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const query = observation.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionState({ actionId, query, visible: true });
      } else {
        setMentionState({ ...mentionState, visible: false });
      }
    } else {
      setMentionState({ ...mentionState, visible: false });
    }
  };

  const handleSelectMention = (actionId: string, userName: string) => {
    const action = project.actions.find(a => a.id === actionId);
    if (!action) return;

    const observation = action.observation || "";
    const lastAtIndex = observation.lastIndexOf('@');
    if (lastAtIndex === -1) return;

    const newObservation = observation.slice(0, lastAtIndex) + '@' + userName + ' ';
    
    handleUpdateActionObservation(actionId, newObservation);
    setMentionState({ actionId: "", query: "", visible: false });
  };

  const renderObservationWithMentions = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+(?:\s\w+)*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const userName = part.slice(1);
        if (availableUsers.find(u => u.name === userName)) {
          return <span key={i} className="bg-indigo-100 text-indigo-700 px-1 rounded font-bold">@{userName}</span>;
        }
      }
      return part;
    });
  };

  return (
    <motion.div 
      id={`project-${project.id}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      <div className="p-4 sm:p-6">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${deadlineStatus.color}`}>
              {deadlineStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(project)}
              className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
              title="Editar Projeto"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(project.id)}
              className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
              title="Excluir Projeto"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6">
          {/* Priority & Number */}
          <div className="flex lg:flex-col items-center gap-3 lg:gap-1 lg:w-24 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border shadow-sm ${priorityColors[project.priority]}`}>
              P{project.priority}
            </span>
            <span className="text-lg font-black text-gray-400">#{project.number}</span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h2>
              {project.completionDate && (
                <span className="bg-emerald-100 text-emerald-700 p-1 rounded-full flex-shrink-0">
                  <CheckCircle2 size={16} />
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><FlaskConical size={12} className="text-gray-300" /> Linha: <span className="text-indigo-600 font-black">{productLines.find(l => l.id === project.productLineId)?.name || 'N/A'}</span></span>
              <span className="flex items-center gap-1.5"><Filter size={12} className="text-gray-300" /> Funil: <span className="text-gray-700">{project.funnelNumber}</span></span>
              <span className="flex items-center gap-1.5"><User size={12} className="text-gray-300" /> Líder: <span className="text-gray-700">{project.leader}</span></span>
              <span className="flex items-center gap-1.5"><Users size={12} className="text-gray-300" /> Equipe: <span className="text-gray-700">{project.team.length}</span></span>
              {project.completionDate && (
                <span className="flex items-center gap-1.5 text-emerald-600"><Calendar size={12} /> Fim: {new Date(project.completionDate).toLocaleDateString('pt-BR')}</span>
              )}
            </div>
          </div>

          {/* Progress & Status */}
          <div className="flex flex-col gap-4 lg:w-64 flex-shrink-0">
            {/* Tech Study Progress */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estudo Técnico: {techActions.filter(a => a.completionDate).length}/{techActions.length}</span>
                <span className="text-[9px] font-black text-emerald-600">{Math.round(techProgress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${techProgress}%` }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>
            {/* Execution Progress */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Execução: {execActions.filter(a => a.completionDate).length}/{execActions.length}</span>
                <span className="text-[9px] font-black text-amber-600">{Math.round(execProgress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${execProgress}%` }}
                  className="h-full rounded-full bg-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2 lg:ml-4 border-l border-gray-100 pl-4">
            {/* Actions moved to top bar, keeping this for spacing or future use if needed, but hiding for now as per request to put status at top */}
          </div>
        </div>

        {/* Time Allocation Section */}
        <div className="border-t border-gray-50 pt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Alocação de Horas (Semana Atual)</h4>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{getCurrentWeek()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {project.team.map(memberName => {
              const week = getCurrentWeek();
              const allocation = timeAllocations.find(a => a.projectId === project.id && a.userName === memberName && a.week === week);
              const totalAllocated = timeAllocations
                .filter(a => a.userName === memberName && a.week === week)
                .reduce((acc, a) => acc + a.hours, 0);
              const availability = userAvailabilities.find(ua => ua.userName === memberName)?.weeklyHours || 40;
              const isOverLimit = totalAllocated > availability;

              return (
                <div key={memberName} className={`p-2 rounded-xl border transition-all ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-[9px] font-black uppercase truncate ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>{memberName}</p>
                    {isOverLimit && <AlertCircle size={10} className="text-red-500" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="0"
                      className={`w-full bg-white border rounded-lg px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 ${isOverLimit ? 'border-red-300 focus:ring-red-500 text-red-700' : 'border-gray-200 focus:ring-indigo-500'}`}
                      value={allocation?.hours || 0}
                      onChange={(e) => {
                        const hours = parseFloat(e.target.value) || 0;
                        let newAllocations;
                        if (allocation) {
                          newAllocations = timeAllocations.map(a => a.id === allocation.id ? { ...a, hours } : a);
                        } else {
                          newAllocations = [...timeAllocations, {
                            id: Math.random().toString(36).substr(2, 9),
                            userName: memberName,
                            projectId: project.id,
                            hours,
                            week
                          }];
                        }
                        onUpdateTimeAllocation(newAllocations);
                      }}
                    />
                    <span className={`text-[9px] font-bold ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>h</span>
                  </div>
                  {isOverLimit && (
                    <p className="text-[8px] font-black text-red-500 uppercase mt-1 leading-tight">limite de horas semanais ultrapassada</p>
                  )}
                </div>
              );
            })}
            {project.team.length === 0 && (
              <p className="col-span-full text-[10px] text-gray-400 italic">Nenhum membro na equipe deste projeto.</p>
            )}
          </div>
        </div>

        {/* Action List Section */}
        <div className="border-t border-gray-50 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ações do Projeto</h4>
            <button 
              onClick={() => setIsAddingAction(!isAddingAction)}
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-widest"
            >
              {isAddingAction ? <X size={12} /> : <Plus size={12} />}
              {isAddingAction ? 'Cancelar' : 'Nova Ação'}
            </button>
          </div>

          <AnimatePresence>
            {isAddingAction && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50 mb-4">
                  <div className="md:col-span-3">
                    <input 
                      type="text" 
                      placeholder="O que fazer?"
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                      value={newAction.description}
                      onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                      value={newAction.stage}
                      onChange={(e) => setNewAction({ ...newAction, stage: e.target.value as any })}
                    >
                      <option value="Estudo Técnico">Estudo</option>
                      <option value="Execução">Execução</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <select 
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                      value={newAction.responsible}
                      onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                    >
                      <option value="">Resp.</option>
                      {availableUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      placeholder="Obs..."
                      className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                      value={newAction.observation}
                      onChange={(e) => setNewAction({ ...newAction, observation: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <input 
                      type="date" 
                      className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                      value={newAction.deadline}
                      onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                    />
                    <button 
                      onClick={handleAddAction}
                      className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-2">
            {project.actions.map((action) => (
              <div key={action.id} className="flex flex-col p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getActionStatus(action) === 'on-time' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                      checked={!!action.completionDate}
                      onChange={(e) => handleToggleAction(action.id, e.target.checked)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${action.completionDate ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
                        {action.description}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <span className={`px-1.5 py-0.5 rounded ${action.stage === 'Estudo Técnico' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{action.stage}</span>
                        <span className="flex items-center gap-1"><User size={10} /> {action.responsible}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(action.deadline).toLocaleDateString('pt-BR')}</span>
                        {action.completionDate && (
                          <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={10} /> {new Date(action.completionDate).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-md relative group/obs">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Observação</p>
                      <span className="text-[8px] text-gray-400 italic opacity-0 group-hover/obs:opacity-100 transition-opacity">Use @ para citar</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Adicionar observação..."
                        className="w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:bg-white px-1 py-1 text-[11px] text-gray-600 outline-none transition-all placeholder:text-gray-300"
                        value={action.observation || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateActionObservation(action.id, val);
                        }}
                      />
                      
                      {/* Mention Dropdown */}
                      <AnimatePresence>
                        {mentionState.visible && mentionState.actionId === action.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 bottom-full mb-2 bg-white border border-gray-100 rounded-xl shadow-xl z-30 min-w-[160px] overflow-hidden"
                          >
                            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Citar Usuário</p>
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                              {availableUsers
                                .filter(u => u.name.toLowerCase().includes(mentionState.query.toLowerCase()))
                                .map(u => (
                                  <button
                                    key={u.name}
                                    onClick={() => handleSelectMention(action.id, u.name)}
                                    className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] text-indigo-600">
                                      {u.name.charAt(0)}
                                    </div>
                                    {u.name}
                                  </button>
                                ))}
                              {availableUsers.filter(u => u.name.toLowerCase().includes(mentionState.query.toLowerCase())).length === 0 && (
                                <p className="p-4 text-[10px] text-gray-400 italic text-center">Nenhum usuário encontrado</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-1 pointer-events-none">
                        <p className="text-[10px] text-gray-500 italic min-h-[1rem]">
                          {renderObservationWithMentions(action.observation || "")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {project.actions.length === 0 && (
              <p className="text-center py-4 text-xs text-gray-400 font-medium italic">Nenhuma ação registrada</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ProjectModalProps {
  project: Project | null;
  availableUsers: UserType[];
  availableStatuses: string[];
  productLines: ProductLine[];
  onAddUser: (user: UserType) => void;
  onDeleteUser: (name: string) => void;
  onClose: () => void;
  onSave: (p: Project) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, availableUsers, availableStatuses, productLines, onAddUser, onDeleteUser, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      priority: Priority.P1,
      number: "",
      name: "",
      funnelNumber: "",
      status: availableStatuses[0] || "Não Iniciado",
      leader: "",
      team: [],
      actions: [],
      openingDate: new Date().toISOString().split('T')[0],
      overallDeadline: "",
      techStudyStart: "",
      techStudyDeadline: "",
      executionStart: "",
      executionDeadline: "",
      justification: "",
      productLineId: "",
    }
  );

  const [newUser, setNewUser] = useState({ name: "", email: "" });

  const toggleTeamMember = (name: string) => {
    const currentTeam = formData.team || [];
    if (currentTeam.includes(name)) {
      setFormData({ ...formData, team: currentTeam.filter(n => n !== name) });
    } else {
      setFormData({ ...formData, team: [...currentTeam, name] });
    }
  };

  const handleRegisterUser = () => {
    if (newUser.name.trim() && newUser.email.trim()) {
      onAddUser({ name: newUser.name.trim(), email: newUser.email.trim() });
      setNewUser({ name: "", email: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProject: Project = {
      id: project?.id || Math.random().toString(36).substr(2, 9),
      createdAt: project?.createdAt || new Date().toISOString(),
      priority: formData.priority || Priority.P1,
      number: formData.number || "",
      name: formData.name || "",
      funnelNumber: formData.funnelNumber || "",
      status: formData.status || (availableStatuses[0] || "Não Iniciado"),
      leader: formData.leader || "",
      team: formData.team || [],
      actions: formData.actions || [],
      completionDate: formData.completionDate,
      openingDate: formData.openingDate || new Date().toISOString().split('T')[0],
      overallDeadline: formData.overallDeadline || "",
      overallExtension: formData.overallExtension,
      techStudyStart: formData.techStudyStart,
      techStudyDeadline: formData.techStudyDeadline,
      techStudyExtension: formData.techStudyExtension,
      executionStart: formData.executionStart,
      executionDeadline: formData.executionDeadline,
      executionExtension: formData.executionExtension,
      justification: formData.justification,
      productLineId: formData.productLineId,
    };
    onSave(finalProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-10 py-8 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900">{project ? 'Editar Projeto' : 'Novo Projeto'}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Preencha os detalhes abaixo</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Prioridade</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p as Priority })}
                    className={`py-3 rounded-2xl border-2 transition-all font-black text-sm ${
                      formData.priority === p 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'border-gray-100 hover:border-indigo-200 text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nº Projeto</label>
              <input 
                required
                type="text" 
                placeholder="Ex: 2024-001"
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nº Funil</label>
              <input 
                required
                type="text" 
                placeholder="Ex: F-42"
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={formData.funnelNumber}
                onChange={(e) => setFormData({ ...formData, funnelNumber: e.target.value })}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Status Atual</label>
              <select 
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  const updates: Partial<Project> = { status: newStatus };
                  if ((newStatus === "Finalizado" || newStatus === "Concluído") && !formData.completionDate) {
                    updates.completionDate = new Date().toISOString();
                  } else if (newStatus !== "Finalizado" && newStatus !== "Concluído") {
                    updates.completionDate = undefined;
                  }
                  setFormData({ ...formData, ...updates });
                }}
              >
                {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Nome do Projeto</label>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <input 
                    type="checkbox" 
                    id="project-complete"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    checked={formData.status === "Finalizado" || formData.status === "Concluído"}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData({
                        ...formData,
                        status: isChecked ? "Finalizado" : "Execução",
                        completionDate: isChecked ? new Date().toISOString() : undefined
                      });
                    }}
                  />
                  <label htmlFor="project-complete" className="text-[10px] font-black text-emerald-700 uppercase cursor-pointer">Projeto Finalizado</label>
                </div>
              </div>
              <input 
                required
                type="text" 
                placeholder="Qual o nome deste projeto?"
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-black placeholder:text-gray-200"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formData.completionDate && (
                <p className="mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={12} /> Finalizado em: {new Date(formData.completionDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Líder Execução P&D</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <select 
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                >
                  <option value="">Selecione o líder</option>
                  {availableUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Linha de Produto</label>
              <div className="relative">
                <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <select 
                  required
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none"
                  value={formData.productLineId}
                  onChange={(e) => setFormData({ ...formData, productLineId: e.target.value })}
                >
                  <option value="">Selecione a linha</option>
                  {productLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Chronogram & Deadlines */}
          <div className="space-y-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Calendar size={20} />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Cronograma e Prazos</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Overall Project */}
              <div className="space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Abertura do Projeto</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Data de Abertura</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.openingDate}
                      onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Prazo Final (Original)</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.overallDeadline}
                      onChange={(e) => setFormData({ ...formData, overallDeadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1">Prorrogação</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      value={formData.overallExtension}
                      onChange={(e) => setFormData({ ...formData, overallExtension: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Study */}
              <div className="space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Estudo Técnico</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Início Estudo</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.techStudyStart}
                      onChange={(e) => setFormData({ ...formData, techStudyStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Prazo Entrega (Original)</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.techStudyDeadline}
                      onChange={(e) => setFormData({ ...formData, techStudyDeadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1">Prorrogação</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      value={formData.techStudyExtension}
                      onChange={(e) => setFormData({ ...formData, techStudyExtension: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Execution */}
              <div className="space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Execução</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Início Execução</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.executionStart}
                      onChange={(e) => setFormData({ ...formData, executionStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Prazo Final (Original)</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.executionDeadline}
                      onChange={(e) => setFormData({ ...formData, executionDeadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-amber-600 uppercase mb-1">Prorrogação</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      value={formData.executionExtension}
                      onChange={(e) => setFormData({ ...formData, executionExtension: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Justificativas para Atrasos / Alterações</label>
              <textarea 
                placeholder="Descreva aqui os motivos para prorrogações ou não atendimento aos prazos originais..."
                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium min-h-[100px]"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              />
            </div>
          </div>

          {/* Team Registration & Selection */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Equipe de Trabalho</label>
                <p className="text-xs text-gray-400 font-medium">Selecione os membros ou cadastre novos abaixo</p>
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Nome colaborador..."
                  className="px-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="E-mail..."
                    className="flex-1 px-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleRegisterUser())}
                  />
                  <button 
                    type="button"
                    onClick={handleRegisterUser}
                    className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-colors"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
              {availableUsers.map((user) => (
                <div key={user.name} className="group/user relative flex items-center">
                  <button
                    key={user.name}
                    type="button"
                    onClick={() => toggleTeamMember(user.name)}
                    className={`pl-5 pr-10 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm ${
                      formData.team?.includes(user.name)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'
                    }`}
                  >
                    {user.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUser(user.name);
                      // Also remove from current form team
                      if (formData.team?.includes(user.name)) {
                        setFormData({
                          ...formData,
                          team: formData.team.filter(n => n !== user.name)
                        });
                      }
                      if (formData.leader === user.name) {
                        setFormData({ ...formData, leader: "" });
                      }
                    }}
                    className={`absolute right-2 p-1 rounded-lg transition-all z-10 ${
                      formData.team?.includes(user.name) 
                        ? 'text-indigo-200 hover:text-white opacity-60 hover:opacity-100' 
                        : 'text-gray-300 hover:text-red-500 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {availableUsers.length === 0 && <p className="text-xs text-gray-300 font-medium italic">Nenhum colaborador cadastrado</p>}
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition-colors"
            >
              Descartar
            </button>
            <button 
              type="submit"
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              Salvar Projeto
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface DataManagementModalProps {
  projects: Project[];
  availableUsers: UserType[];
  availableStatuses: string[];
  onClose: () => void;
  onImport: (data: { projects?: Project[]; users?: UserType[]; statuses?: string[] }) => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ projects, availableUsers, availableStatuses, onClose, onImport }) => {
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Projects Sheet
    const projectsData = projects.map(p => ({
      ID: p.id,
      Prioridade: `P${p.priority}`,
      Numero: p.number,
      Nome: p.name,
      Funil: p.funnelNumber,
      Status: p.status,
      Lider: p.leader,
      Equipe: p.team.join(', '),
      Acoes_Total: p.actions.length,
      Acoes_Concluidas: p.actions.filter(a => a.completionDate).length,
      Criado_Em: p.createdAt,
      Concluido_Em: p.completionDate || '',
      Abertura: p.openingDate,
      Prazo_Geral: p.overallDeadline,
      Prorrogacao_Geral: p.overallExtension || '',
      Estudo_Inicio: p.techStudyStart || '',
      Estudo_Prazo: p.techStudyDeadline || '',
      Estudo_Prorrogacao: p.techStudyExtension || '',
      Execucao_Inicio: p.executionStart || '',
      Execucao_Prazo: p.executionDeadline || '',
      Execucao_Prorrogacao: p.executionExtension || '',
      Justificativa: p.justification || ''
    }));
    const wsProjects = XLSX.utils.json_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(wb, wsProjects, "Projetos");

    // Actions Sheet
    const actionsData = projects.flatMap(p => p.actions.map(a => ({
      Projeto: p.name,
      Projeto_ID: p.id,
      Acao_ID: a.id,
      Etapa: a.stage,
      Descricao: a.description,
      Responsavel: a.responsible,
      Prazo: a.deadline,
      Conclusao: a.completionDate || '',
      Observacao: a.observation || ''
    })));
    const wsActions = XLSX.utils.json_to_sheet(actionsData);
    XLSX.utils.book_append_sheet(wb, wsActions, "Ações");

    // Users Sheet
    const wsUsers = XLSX.utils.json_to_sheet(availableUsers);
    XLSX.utils.book_append_sheet(wb, wsUsers, "Colaboradores");

    XLSX.writeFile(wb, `Gestor_Projetos_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // Basic import logic - primarily for projects
      const wsProjects = wb.Sheets["Projetos"];
      if (wsProjects) {
        const data = XLSX.utils.sheet_to_json(wsProjects) as any[];
        const importedProjects: Project[] = data.map(row => ({
          id: row.ID || Math.random().toString(36).substr(2, 9),
          priority: parseInt(row.Prioridade?.replace('P', '') || '1') as Priority,
          number: String(row.Numero || ''),
          name: String(row.Nome || ''),
          funnelNumber: String(row.Funil || ''),
          status: String(row.Status || 'Execução'),
          leader: String(row.Lider || ''),
          team: row.Equipe ? row.Equipe.split(',').map((s: string) => s.trim()) : [],
          actions: [], // Actions are complex to sync back from flat sheet without careful mapping
          createdAt: row.Criado_Em || new Date().toISOString(),
          completionDate: row.Concluido_Em || undefined,
          openingDate: row.Abertura || new Date().toISOString().split('T')[0],
          overallDeadline: row.Prazo_Geral || '',
          overallExtension: row.Prorrogacao_Geral || undefined,
          techStudyStart: row.Estudo_Inicio || undefined,
          techStudyDeadline: row.Estudo_Prazo || undefined,
          techStudyExtension: row.Estudo_Prorrogacao || undefined,
          executionStart: row.Execucao_Inicio || undefined,
          executionDeadline: row.Execucao_Prazo || undefined,
          executionExtension: row.Execucao_Prorrogacao || undefined,
          justification: row.Justificativa || ''
        }));

        // Try to recover actions if sheet exists
        const wsActions = wb.Sheets["Ações"];
        if (wsActions) {
          const actionsRaw = XLSX.utils.sheet_to_json(wsActions) as any[];
          importedProjects.forEach(p => {
            p.actions = actionsRaw
              .filter(a => a.Projeto_ID === p.id)
              .map(a => ({
                id: a.Acao_ID || Math.random().toString(36).substr(2, 9),
                description: a.Descricao,
                responsible: a.Responsavel,
                deadline: a.Prazo,
                completionDate: a.Conclusao || undefined,
                observation: a.Observacao || "",
                stage: (a.Etapa === 'Execução' ? 'Execução' : 'Estudo Técnico') as 'Estudo Técnico' | 'Execução'
              }));
          });
        }

        if (confirm(`Deseja importar ${importedProjects.length} projetos? Isso substituirá os dados atuais.`)) {
          onImport({ projects: importedProjects });
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportJSON = () => {
    const data = { projects, availableUsers, availableStatuses };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gestor_Projetos_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (confirm("Deseja restaurar este backup completo? Todos os dados atuais serão substituídos.")) {
          onImport(data);
        }
      } catch (err) {
        alert("Erro ao ler arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900">Sincronizar Dados</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Excel (Planilha)</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={exportToExcel} className="flex flex-col items-center gap-3 p-6 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 hover:bg-emerald-100 transition-all group">
                <FileSpreadsheet size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Exportar Excel</span>
              </button>
              <label className="flex flex-col items-center gap-3 p-6 bg-blue-50 text-blue-700 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all group cursor-pointer">
                <Upload size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Importar Excel</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Backup Completo (JSON)</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={exportJSON} className="flex flex-col items-center gap-3 p-6 bg-indigo-50 text-indigo-700 rounded-3xl border border-indigo-100 hover:bg-indigo-100 transition-all group">
                <Download size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Baixar Backup</span>
              </button>
              <label className="flex flex-col items-center gap-3 p-6 bg-purple-50 text-purple-700 rounded-3xl border border-purple-100 hover:bg-purple-100 transition-all group cursor-pointer">
                <Database size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Restaurar</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
              </label>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
              DICA: Os dados são salvos automaticamente no seu navegador. Use estas opções para transferir dados entre computadores ou manter uma cópia de segurança em Excel.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const getWeekNumber = (d: Date) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

interface TimeManagementModalProps {
  projects: Project[];
  users: UserType[];
  availabilities: UserAvailability[];
  allocations: TimeAllocation[];
  activityTypes: string[];
  onClose: () => void;
  onSaveAvailabilities: (availabilities: UserAvailability[]) => void;
  onSaveAllocations: (allocations: TimeAllocation[]) => void;
  onSaveActivityTypes: (types: string[]) => void;
}

const TimeManagementModal: React.FC<TimeManagementModalProps> = ({ 
  projects, users, availabilities, allocations, activityTypes, onClose, 
  onSaveAvailabilities, onSaveAllocations, onSaveActivityTypes 
}) => {
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [selectedUser, setSelectedUser] = useState(users[0]?.name || "");
  const [newActivityType, setNewActivityType] = useState("");
  const [isEditingTypes, setIsEditingTypes] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const userAvailability = availabilities.find(a => a.userName === selectedUser)?.weeklyHours || 44;
  const userAllocations = allocations.filter(a => a.userName === selectedUser && a.week === currentWeek);
  
  const totalAllocated = userAllocations.reduce((acc, a) => acc + a.hours, 0);
  const remainingHours = userAvailability - totalAllocated;

  const handleAddAllocation = (projectId?: string, activityType?: string, hours: number = 0) => {
    const newAllocation: TimeAllocation = {
      id: Math.random().toString(36).substr(2, 9),
      userName: selectedUser,
      projectId,
      activityType,
      hours,
      week: currentWeek
    };
    onSaveAllocations([...allocations, newAllocation]);
  };

  const handleUpdateHours = (id: string, hours: number) => {
    onSaveAllocations(allocations.map(a => a.id === id ? { ...a, hours } : a));
  };

  const handleRemoveAllocation = (id: string) => {
    onSaveAllocations(allocations.filter(a => a.id !== id));
  };

  const handleUpdateAvailability = (hours: number) => {
    const existing = availabilities.find(a => a.userName === selectedUser);
    if (existing) {
      onSaveAvailabilities(availabilities.map(a => a.userName === selectedUser ? { ...a, weeklyHours: hours } : a));
    } else {
      onSaveAvailabilities([...availabilities, { userName: selectedUser, weeklyHours: hours }]);
    }
  };

  const handleAddActivityType = () => {
    if (newActivityType.trim() && !activityTypes.includes(newActivityType.trim())) {
      onSaveActivityTypes([...activityTypes, newActivityType.trim()]);
      setNewActivityType("");
    }
  };

  const handleRemoveActivityType = (type: string) => {
    onSaveActivityTypes(activityTypes.filter(t => t !== type));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Gestão de Horas Semanais</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alocação de Tempo e Disponibilidade</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                {users.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Semana</label>
              <input 
                type="week" 
                value={currentWeek} 
                onChange={(e) => setCurrentWeek(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Disponibilidade Semanal</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={userAvailability} 
                    onChange={(e) => handleUpdateAvailability(Number(e.target.value))}
                    className="bg-transparent text-4xl font-black w-20 outline-none border-b-2 border-white/30 focus:border-white"
                  />
                  <span className="text-2xl font-bold opacity-60">horas</span>
                </div>
              </div>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Alocado</p>
                <p className="text-2xl font-black">{totalAllocated}h</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Restante</p>
                <p className={`text-2xl font-black ${remainingHours < 0 ? 'text-red-300' : ''}`}>{remainingHours}h</p>
              </div>
            </div>
          </div>

          {/* Allocations Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Allocations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Projetos Alocados</h3>
                <div className="relative">
                  <button 
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-all"
                  >
                    <Plus size={12} /> Adicionar Projeto
                  </button>
                  {showProjectDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowProjectDropdown(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20">
                        {projects.filter(p => p.team.includes(selectedUser) && !userAllocations.find(a => a.projectId === p.id)).map(p => (
                          <button 
                            key={p.id} 
                            onClick={() => {
                              handleAddAllocation(p.id);
                              setShowProjectDropdown(false);
                            }}
                            className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all"
                          >
                            {p.name}
                          </button>
                        ))}
                        {projects.filter(p => p.team.includes(selectedUser) && !userAllocations.find(a => a.projectId === p.id)).length === 0 && (
                          <p className="p-3 text-[10px] text-gray-400 italic">Nenhum projeto disponível</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {userAllocations.filter(a => a.projectId).map(a => {
                  const project = projects.find(p => p.id === a.projectId);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-900">{project?.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">#{project?.number}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                          <input 
                            type="number" 
                            value={a.hours} 
                            onChange={(e) => handleUpdateHours(a.id, Number(e.target.value))}
                            className="w-10 text-center text-xs font-black outline-none"
                          />
                          <span className="text-[10px] font-bold text-gray-400">h</span>
                        </div>
                        <button onClick={() => handleRemoveAllocation(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {userAllocations.filter(a => a.projectId).length === 0 && (
                  <p className="text-center py-8 text-gray-400 italic text-xs">Nenhum projeto alocado nesta semana.</p>
                )}
              </div>
            </div>

            {/* Other Activities */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Outras Atividades</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingTypes(!isEditingTypes)}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-all"
                  >
                    {isEditingTypes ? "Concluído" : "Editar Tipos"}
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-all"
                    >
                      <Plus size={12} /> Adicionar Atividade
                    </button>
                    {showActivityDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActivityDropdown(false)} />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20">
                          {activityTypes.map(type => (
                            <button 
                              key={type} 
                              onClick={() => {
                                handleAddAllocation(undefined, type);
                                setShowActivityDropdown(false);
                              }}
                              className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isEditingTypes && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Novo tipo..."
                      value={newActivityType}
                      onChange={(e) => setNewActivityType(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={handleAddActivityType} className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activityTypes.map(type => (
                      <span key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-600">
                        {type}
                        <button onClick={() => handleRemoveActivityType(type)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {userAllocations.filter(a => a.activityType).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-900">{a.activityType}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                        <input 
                          type="number" 
                          value={a.hours} 
                          onChange={(e) => handleUpdateHours(a.id, Number(e.target.value))}
                          className="w-10 text-center text-xs font-black outline-none"
                        />
                        <span className="text-[10px] font-bold text-gray-400">h</span>
                      </div>
                      <button onClick={() => handleRemoveAllocation(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {userAllocations.filter(a => a.activityType).length === 0 && (
                  <p className="text-center py-8 text-gray-400 italic text-xs">Nenhuma outra atividade alocada.</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Summary Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900">Resumo da Equipe (Semana {currentWeek})</h3>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Disponibilidade</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Alocado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => {
                    const availability = availabilities.find(a => a.userName === u.name)?.weeklyHours || 44;
                    const allocated = allocations
                      .filter(a => a.userName === u.name && a.week === currentWeek)
                      .reduce((acc, a) => acc + a.hours, 0);
                    const remaining = availability - allocated;
                    return (
                      <tr key={u.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.name}</td>
                        <td className="px-6 py-4 text-center text-sm font-black text-gray-900">{availability}h</td>
                        <td className="px-6 py-4 text-center text-sm font-black text-indigo-600">{allocated}h</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {remaining}h
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Concluído
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface StatusModalProps {
  statuses: string[];
  onClose: () => void;
  onSave: (statuses: string[]) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ statuses, onClose, onSave }) => {
  const [localStatuses, setLocalStatuses] = useState<string[]>(statuses);
  const [newStatus, setNewStatus] = useState("");

  const handleAddStatus = () => {
    if (newStatus.trim() && !localStatuses.includes(newStatus.trim())) {
      setLocalStatuses([...localStatuses, newStatus.trim()]);
      setNewStatus("");
    }
  };

  const handleRemoveStatus = (status: string) => {
    setLocalStatuses(prev => prev.filter(s => s !== status));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900">Gerenciar Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Novo status..."
              className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
            />
            <button 
              onClick={handleAddStatus}
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {localStatuses.map(status => (
              <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                <span className="font-bold text-gray-700">{status}</span>
                <button 
                  onClick={() => handleRemoveStatus(status)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-60 hover:opacity-100 z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 bg-gray-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancelar</button>
          <button 
            onClick={() => {
              onSave(localStatuses);
              onClose();
            }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
