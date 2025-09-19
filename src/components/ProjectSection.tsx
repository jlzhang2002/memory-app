import React, { useState } from 'react';
import { Plus, FolderOpen, Target, Clock, CheckCircle, AlertCircle, Play, Pause, Square } from 'lucide-react';
import { Project, ProjectStage, Challenge, ProjectFolder } from '../types';

interface ProjectSectionProps {
  projects: Project[];
  onAdd: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, project: Partial<Project>) => void;
  projectFolders: ProjectFolder[];
  onAddProjectFolder: (name: string) => void;
  onUpdateProjectFolder: (id: string, newName: string) => void;
  onDeleteProjectFolder: (id: string) => void;
  selectedProjectFolderId: string | null;
  openPromptDialog: (message: string, onConfirm: (value: string) => void, onCancel?: () => void, initialValue?: string, placeholder?: string) => void;
}

export default function ProjectSection({ 
  projects, 
  onAdd, 
  onUpdate, 
  projectFolders, 
  onAddProjectFolder, 
  onUpdateProjectFolder, 
  onDeleteProjectFolder, 
  selectedProjectFolderId,
  openPromptDialog
}: ProjectSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showStageForm, setShowStageForm] = useState(false);

  // Filter projects based on selected folder
  const filteredProjects = projects.filter(project => {
    if (selectedProjectFolderId === null) {
      return !project.folderId; // Show uncategorized projects
    }
    return project.folderId === selectedProjectFolderId;
  });

  const getCurrentFolderName = () => {
    if (selectedProjectFolderId === null) return '未归类';
    const folder = projectFolders.find(f => f.id === selectedProjectFolderId);
    return folder ? folder.name : '未知文件夹';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const project: Omit<Project, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      purpose: formData.get('purpose') as string,
      status: 'planning',
      startDate: formData.get('startDate') as string,
      stages: [],
      folderId: formData.get('folderId') as string || undefined
    };
    
    onAdd(project);
    setShowForm(false);
    (e.target as HTMLFormElement).reset();
  };

  const addStage = (projectId: string, stageData: Omit<ProjectStage, 'id' | 'createdAt'>) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newStage: ProjectStage = {
      ...stageData,
      id: Date.now().toString(),
      archived: false,
      createdAt: new Date().toISOString()
    };

    onUpdate(projectId, {
      stages: [...project.stages, newStage]
    });
  };

  const addChallenge = (projectId: string, stageId: string, challengeData: Omit<Challenge, 'id' | 'createdAt'>) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newChallenge: Challenge = {
      ...challengeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedStages = project.stages.map(stage =>
      stage.id === stageId 
        ? { ...stage, challenges: [...stage.challenges, newChallenge] }
        : stage
    );

    onUpdate(projectId, { stages: updatedStages });
  };

  const archiveStage = (projectId: string, stageId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedStages = project.stages.map(stage =>
      stage.id === stageId 
        ? { ...stage, archived: true, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] }
        : stage
    );

    onUpdate(projectId, { stages: updatedStages });
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    onUpdate(projectId, { status });
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-orange-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <Square className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    const labels = {
      planning: '规划中',
      active: '进行中',
      paused: '暂停',
      completed: '已完成',
      cancelled: '已取消'
    };
    return labels[status];
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            项目推进记录 - {getCurrentFolderName()}
          </h2>
          <p className="text-gray-600">
            管理项目进度，记录挑战与解决方案 
            {selectedProjectFolderId === null && ' (双击左侧"项目推进记录"可创建新文件夹)'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          创建项目
        </button>
      </div>

      {/* 创建项目表单 */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">创建新项目</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">项目名称</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">项目目的</label>
              <textarea
                name="purpose"
                required
                rows={3}
                placeholder="这个项目要实现什么目标？"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
              <input
                name="startDate"
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属文件夹</label>
              <select
                name="folderId"
                defaultValue={selectedProjectFolderId || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">未归类</option>
                {projectFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                创建项目
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 项目列表 */}
      <div className="space-y-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(project.status)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {project.folderId ? 
                        projectFolders.find(f => f.id === project.folderId)?.name || '未知文件夹' : 
                        '未归类'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={project.folderId || ''}
                  onChange={(e) => onUpdate(project.id, { folderId: e.target.value || undefined })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">未归类</option>
                  {projectFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value as Project['status'])}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="planning">规划中</option>
                  <option value="active">进行中</option>
                  <option value="paused">暂停</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" />
                项目目的
              </h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{project.purpose}</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">项目阶段</h4>
                <button
                  onClick={() => {
                    setSelectedProject(project.id);
                    setShowStageForm(true);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + 添加阶段
                </button>
              </div>

              {project.stages.length > 0 ? (
                <div className="space-y-3">
                  {project.stages.map((stage, index) => (
                    <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-800">
                          阶段 {index + 1}: {stage.title}
                          {stage.archived && <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded-full">已存档</span>}
                        </h5>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                            stage.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stage.status === 'completed' ? '已完成' :
                             stage.status === 'active' ? '进行中' : '待开始'}
                          </span>
                          {!stage.archived && (
                            <button
                              onClick={() => archiveStage(project.id, stage.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              标记已解决
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                      
                      {stage.endDate && (
                        <p className="text-xs text-gray-500 mb-3">完成时间: {stage.endDate}</p>
                      )}

                      {stage.challenges.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            挑战与解决方案
                          </h6>
                          <div className="space-y-2">
                            {stage.challenges.map((challenge) => (
                              <div key={challenge.id} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <h6 className="text-sm font-medium text-gray-800">问题</h6>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      challenge.status === 'solved' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {challenge.status === 'solved' ? '已解决' : '未解决'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{challenge.problem}</p>
                                  
                                  {challenge.solution && (
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-800 mb-1">解决方法</h6>
                                      <p className="text-sm text-gray-700">{challenge.solution}</p>
                                    </div>
                                  )}
                                  
                                  {challenge.practiceEffect && (
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-800 mb-1">实践效果</h6>
                                      <p className="text-sm text-gray-700">{challenge.practiceEffect}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!stage.archived && (
                        <button
                          onClick={() => {
                            openPromptDialog(
                              '描述遇到的问题:',
                              (problem) => {
                                openPromptDialog(
                                  '解决方法 (可选):',
                                  (solution) => {
                                    if (solution) {
                                      openPromptDialog(
                                        '实践效果 (可选):',
                                        (practiceEffect) => {
                                          addChallenge(project.id, stage.id, {
                                            problem,
                                            solution,
                                            practiceEffect,
                                            status: 'solved'
                                          });
                                        },
                                        () => {
                                          addChallenge(project.id, stage.id, {
                                            problem,
                                            solution,
                                            practiceEffect: '',
                                            status: 'solved'
                                          });
                                        },
                                        '',
                                        '实践效果'
                                      );
                                    } else {
                                      addChallenge(project.id, stage.id, {
                                        problem,
                                        solution: '',
                                        practiceEffect: '',
                                        status: 'unsolved'
                                      });
                                    }
                                  },
                                  () => {
                                    addChallenge(project.id, stage.id, {
                                      problem,
                                      solution: '',
                                      practiceEffect: '',
                                      status: 'unsolved'
                                    });
                                  },
                                  '',
                                  '解决方法'
                                );
                              },
                              undefined,
                              '',
                              '问题描述'
                            );
                          }}
                          className="text-xs text-orange-600 hover:text-orange-700"
                        >
                          + 记录问题
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无项目阶段</p>
              )}
            </div>

            <div className="text-sm text-gray-500">
              开始时间: {project.startDate}
              {project.endDate && ` • 结束时间: ${project.endDate}`}
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {selectedProjectFolderId === null ? 
              '该文件夹中还没有项目' : 
              '未归类中还没有项目'
            }
          </div>
        )}
      </div>

      {/* 添加阶段表单 */}
      {showStageForm && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加项目阶段</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                addStage(selectedProject, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  challenges: [],
                  status: 'pending'
                });
                setShowStageForm(false);
                setSelectedProject(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">阶段标题</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">阶段描述</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  添加阶段
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStageForm(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}