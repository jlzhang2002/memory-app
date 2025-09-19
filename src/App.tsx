import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Memory, Thought, Observation, Person, SocialRecord, Evaluation, DailyPlan, Project, CategoryGroup, ProjectFolder } from './types';
import { ExportData } from './utils/exportData';
import LoginForm from './components/LoginForm';
import AlertDialog from './components/AlertDialog';
import ConfirmDialog from './components/ConfirmDialog';
import PromptDialog from './components/PromptDialog';
import Sidebar from './components/Sidebar';
import MemorySection from './components/MemorySection';
import DailyPlanSection from './components/DailyPlanSection';
import ProjectSection from './components/ProjectSection';
import SettingsSection from './components/SettingsSection';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function App() {
  const { authState, login, register, logout, updateProfile } = useAuth();

  const [activeSection, setActiveSection] = useState('memories');
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [memories, setMemories] = useLocalStorage<Memory[]>('memories', []);
  const [dailyPlans, setDailyPlans] = useLocalStorage<DailyPlan[]>(`dailyPlans_${authState.user?.id || 'guest'}`, []);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [projectFolders, setProjectFolders] = useLocalStorage<ProjectFolder[]>('projectFolders', []);
  const [selectedProjectFolderId, setSelectedProjectFolderId] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useLocalStorage<CategoryGroup[]>('categoryGroups', [
    { id: 'personal', name: '个人相关', subcategories: ['个人成长', '健康', '学习', '兴趣爱好'] },
    { id: 'social', name: '人与人相关', subcategories: ['家庭', '朋友', '同事', '社交活动'] },
    { id: 'world', name: '客观世界的探索', subcategories: ['工作项目', '技术研究', '旅行', '观察思考'] }
  ]);
  const [exportPath, setExportPath] = useLocalStorage<string>('exportPath', '');

  // 如果用户未登录，显示登录界面
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  // Dialog states
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    message: string;
    onClose: () => void;
  }>({
    isOpen: false,
    message: '',
    onClose: () => {}
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    message: string;
    initialValue: string;
    placeholder: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    message: '',
    initialValue: '',
    placeholder: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Dialog functions
  const openAlertDialog = (message: string, onClose?: () => void) => {
    setAlertDialog({
      isOpen: true,
      message,
      onClose: () => {
        setAlertDialog(prev => ({ ...prev, isOpen: false }));
        onClose?.();
      }
    });
  };

  const openConfirmDialog = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onCancel?.();
      }
    });
  };

  const openPromptDialog = (
    message: string, 
    onConfirm: (value: string) => void, 
    onCancel?: () => void,
    initialValue = '',
    placeholder = ''
  ) => {
    setPromptDialog({
      isOpen: true,
      message,
      initialValue,
      placeholder,
      onConfirm: (value: string) => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        onConfirm(value);
      },
      onCancel: () => {
        setPromptDialog(prev => ({ ...prev, isOpen: false }));
        onCancel?.();
      }
    });
  };

  const addMemory = (memory: Omit<Memory, 'id' | 'createdAt'>) => {
    const newMemory: Memory = {
      ...memory,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setMemories([newMemory, ...memories]);
  };

  const editMemory = (id: string, updates: Partial<Memory>) => {
    setMemories(memories.map(memory => 
      memory.id === id ? { 
        ...memory, 
        ...updates, 
        lastModified: new Date().toISOString() 
      } : memory
    ));
  };

  const addDailyPlan = (plan: Omit<DailyPlan, 'id' | 'createdAt'>) => {
    const newPlan: DailyPlan = {
      ...plan,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setDailyPlans([newPlan, ...dailyPlans]);
  };

  const updateDailyPlan = (id: string, updates: Partial<DailyPlan>) => {
    setDailyPlans(dailyPlans.map(plan => 
      plan.id === id ? { ...plan, ...updates } : plan
    ));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const addProjectFolder = (name: string) => {
    const newFolder: ProjectFolder = {
      id: generateId(),
      name: name.trim(),
    };
    setProjectFolders([...projectFolders, newFolder]);
  };

  const updateProjectFolder = (id: string, newName: string) => {
    setProjectFolders(projectFolders.map(folder =>
      folder.id === id ? { ...folder, name: newName.trim() } : folder
    ));
  };

  const deleteProjectFolder = (id: string) => {
    // Remove folder
    setProjectFolders(projectFolders.filter(folder => folder.id !== id));
    // Move projects in this folder to uncategorized
    setProjects(projects.map(project =>
      project.folderId === id ? { ...project, folderId: undefined } : project
    ));
    // Reset selection if deleted folder was selected
    if (selectedProjectFolderId === id) {
      setSelectedProjectFolderId(null);
    }
  };

  const exportData: ExportData = {
    memories,
    thoughts: [],
    observations: [],
    people: [],
    socialRecords: [],
    evaluations: [],
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'memories':
        return <MemorySection 
          memories={memories} 
          onAdd={addMemory} 
          onEdit={editMemory}
          showForm={showMemoryForm}
          onToggleForm={() => setShowMemoryForm(!showMemoryForm)}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          categoryGroups={categoryGroups}
        />;
      case 'daily-plan':
        return <DailyPlanSection 
          dailyPlans={dailyPlans} 
          onAdd={addDailyPlan} 
          onUpdate={updateDailyPlan}
        />;
      case 'projects':
        return <ProjectSection 
          projects={projects} 
          onAdd={addProject} 
          onUpdate={updateProject}
          projectFolders={projectFolders}
          onAddProjectFolder={addProjectFolder}
          onUpdateProjectFolder={updateProjectFolder}
          onDeleteProjectFolder={deleteProjectFolder}
          selectedProjectFolderId={selectedProjectFolderId}
          openPromptDialog={openPromptDialog}
        />;
      case 'settings':
        return <SettingsSection 
          data={exportData} 
          exportPath={exportPath} 
          onExportPathChange={setExportPath}
          categoryGroups={categoryGroups}
          onUpdateCategoryGroups={setCategoryGroups}
          openAlertDialog={openAlertDialog}
          openPromptDialog={openPromptDialog}
          user={authState.user}
          onUpdateProfile={updateProfile}
          onLogout={logout}
        />;
      default:
        return <MemorySection 
          memories={memories} 
          onAdd={addMemory} 
          onEdit={editMemory}
          showForm={showMemoryForm}
          onToggleForm={() => setShowMemoryForm(!showMemoryForm)}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
        />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        memories={memories}
        categoryGroups={categoryGroups}
        onAddMemory={() => setShowMemoryForm(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        projectFolders={projectFolders}
        onAddProjectFolder={addProjectFolder}
        onUpdateProjectFolder={updateProjectFolder}
        onDeleteProjectFolder={deleteProjectFolder}
        selectedProjectFolderId={selectedProjectFolderId}
        onSelectProjectFolder={setSelectedProjectFolderId}
        openConfirmDialog={openConfirmDialog}
        openPromptDialog={openPromptDialog}
      />
      <main className={`flex-1 overflow-auto flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      }`}>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {activeSection === 'memories' && '记忆库'}
                {activeSection === 'daily-plan' && '每日计划'}
                {activeSection === 'projects' && '项目推进记录'}
                {activeSection === 'settings' && '设置'}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex-1">
        {renderActiveSection()}
        </div>
      </main>

      {/* Custom Dialogs */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        message={alertDialog.message}
        onClose={alertDialog.onClose}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
      <PromptDialog
        isOpen={promptDialog.isOpen}
        message={promptDialog.message}
        initialValue={promptDialog.initialValue}
        placeholder={promptDialog.placeholder}
        onConfirm={promptDialog.onConfirm}
        onCancel={promptDialog.onCancel}
      />
    </div>
  );
}

export default App;