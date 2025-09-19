import React, { useState } from 'react';
import { 
  Brain, 
  Settings,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  FolderOpen,
  Star,
  Folder,
  Edit3,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { Memory, CategoryGroup, ProjectFolder } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  memories: Memory[];
  categoryGroups: CategoryGroup[];
  onAddMemory: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  projectFolders: ProjectFolder[];
  onAddProjectFolder: (name: string) => void;
  onUpdateProjectFolder: (id: string, newName: string) => void;
  onDeleteProjectFolder: (id: string) => void;
  selectedProjectFolderId: string | null;
  onSelectProjectFolder: (folderId: string | null) => void;
  openConfirmDialog: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  openPromptDialog: (message: string, onConfirm: (value: string) => void, onCancel?: () => void, initialValue?: string, placeholder?: string) => void;
}

export default function Sidebar({ 
  collapsed,
  onToggleCollapse,
  activeSection, 
  onSectionChange, 
  memories,
  categoryGroups,
  onAddMemory,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  projectFolders,
  onAddProjectFolder,
  onUpdateProjectFolder,
  onDeleteProjectFolder,
  selectedProjectFolderId,
  onSelectProjectFolder,
  openConfirmDialog,
  openPromptDialog
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['personal']));
  const [expandedProjectsSection, setExpandedProjectsSection] = useState(false);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getCategoryCount = (category: string) => {
    return memories.filter(memory => memory.category === category).length;
  };

  const getGroupCount = (groupId: string) => {
    const group = categoryGroups.find(g => g.id === groupId);
    if (!group) return 0;
    return group.subcategories.reduce((total, cat) => total + getCategoryCount(cat), 0);
  };

  const handleProjectFolderDoubleClick = () => {
    openPromptDialog(
      '输入新文件夹名称:',
      (folderName) => {
        onAddProjectFolder(folderName);
      },
      undefined,
      '',
      '文件夹名称'
    );
  };

  const handleEditFolder = (e: React.MouseEvent, folderId: string, currentName: string) => {
    e.stopPropagation();
    openPromptDialog(
      '修改文件夹名称:',
      (newName) => {
        if (newName !== currentName) {
          onUpdateProjectFolder(folderId, newName);
        }
      },
      undefined,
      currentName,
      '文件夹名称'
    );
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string, folderName: string) => {
    e.stopPropagation();
    openConfirmDialog(
      `确定要删除文件夹"${folderName}"吗？该文件夹下的项目将移至未归类。`,
      () => {
        onDeleteProjectFolder(folderId);
      }
    );
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 relative`}>
      {/* 收起/展开按钮 */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        title={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-gray-600" /> : <ChevronLeft className="w-3 h-3 text-gray-600" />}
      </button>

      <div className="p-6 border-b border-gray-200">
        <h1 className={`text-xl font-bold text-gray-900 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <Star className="w-6 h-6 text-blue-600" />
          {!collapsed && (
            <div className="flex flex-col">
              <span>个人记忆系统</span>
            </div>
          )}
        </h1>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {/* 记忆库主入口 */}
          <button
            onClick={() => onSectionChange('memories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${collapsed ? 'justify-center' : ''} ${
              activeSection === 'memories'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? '记忆库' : ''}
          >
            <Brain className="w-5 h-5" />
            {!collapsed && (
              <>
                <span className="flex-1">记忆库</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {memories.length}
                </span>
              </>
            )}
          </button>

          {/* 搜索框 */}
          {activeSection === 'memories' && !collapsed && (
            <div className="ml-4 mt-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索记忆..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* 分类浏览 */}
          {activeSection === 'memories' && !collapsed && (
            <div className="ml-4 space-y-1">
              <button
                onClick={() => onCategoryChange('all')}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>全部记忆</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {memories.length}
                </span>
              </button>

              {categoryGroups.map((group) => (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {expandedGroups.has(group.id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                    <span className="flex-1 text-left">{group.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {getGroupCount(group.id)}
                    </span>
                  </button>
                  
                  {expandedGroups.has(group.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {group.subcategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => onCategoryChange(category)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{category}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                            {getCategoryCount(category)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 每日计划 */}
          <button
            onClick={() => onSectionChange('daily-plan')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${collapsed ? 'justify-center' : ''} ${
              activeSection === 'daily-plan'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? '每日计划' : ''}
          >
            <Calendar className="w-5 h-5" />
            {!collapsed && '每日计划'}
          </button>

          {/* 项目推进记录 */}
          <button
            onClick={() => {
              onSectionChange('projects');
              if (!collapsed) {
                setExpandedProjectsSection(!expandedProjectsSection);
              }
            }}
            onDoubleClick={handleProjectFolderDoubleClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${collapsed ? 'justify-center' : ''} ${
              activeSection === 'projects'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? '项目推进记录' : ''}
          >
            <FolderOpen className="w-5 h-5" />
            {!collapsed && (
              <>
                <span className="flex-1">项目推进记录</span>
                {expandedProjectsSection ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </>
            )}
          </button>

          {/* 项目文件夹子选项 */}
          {activeSection === 'projects' && expandedProjectsSection && !collapsed && (
            <div className="ml-4 mt-2 space-y-1">
              {/* 未归类项目 */}
              <button
                onClick={() => onSelectProjectFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedProjectFolderId === null
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span>未归类</span>
                </div>
              </button>

              {/* 项目文件夹 */}
              {projectFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => onSelectProjectFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedProjectFolderId === folder.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span>{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditFolder(e, folder.id, folder.name)}
                      className="p-1 hover:bg-purple-200 rounded"
                      title="编辑文件夹"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                      className="p-1 hover:bg-red-200 rounded text-red-600"
                      title="删除文件夹"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 设置 */}
          <button
            onClick={() => onSectionChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${collapsed ? 'justify-center' : ''} ${
              activeSection === 'settings'
                ? 'bg-gray-50 text-gray-700 border border-gray-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={collapsed ? '设置' : ''}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && '设置'}
          </button>
        </div>
      </nav>
      
      {/* 快速添加按钮 */}
      {activeSection === 'memories' && !collapsed && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onAddMemory}
            className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加记忆
          </button>
        </div>
      )}
    </div>
  );
}