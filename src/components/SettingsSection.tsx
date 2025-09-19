import React, { useState } from 'react';
import { Settings, FolderOpen, Edit3, Plus, Trash2, User } from 'lucide-react';
import { ExportData, downloadAllDataTxtFile } from '../utils/exportData';
import { CategoryGroup, User as UserType } from '../types';
import UserProfile from './UserProfile';

interface SettingsSectionProps {
  data: ExportData;
  onExportPathChange: (path: string) => void;
  exportPath: string;
  categoryGroups: CategoryGroup[];
  onUpdateCategoryGroups: (groups: CategoryGroup[]) => void;
  openAlertDialog: (message: string, onClose?: () => void) => void;
  openPromptDialog: (message: string, onConfirm: (value: string) => void, onCancel?: () => void, initialValue?: string, placeholder?: string) => void;
  user: UserType | null;
  onUpdateProfile: (updates: Partial<Pick<UserType, 'username' | 'email'>>) => Promise<{ success: boolean; message: string }>;
  onLogout: () => void;
}

export default function SettingsSection({ 
  data, 
  onExportPathChange, 
  exportPath, 
  categoryGroups, 
  onUpdateCategoryGroups,
  openAlertDialog,
  openPromptDialog,
  user,
  onUpdateProfile,
  onLogout
}: SettingsSectionProps) {
  const [autoExport, setAutoExport] = useState(false);
  const [exportInterval, setExportInterval] = useState('daily');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onExportPathChange(e.target.value);
  };

  const handleDirectorySelect = async () => {
    try {
      // 使用现代浏览器的文件系统访问API（如果支持）
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker();
        onExportPathChange(dirHandle.name);
      } else {
        // 降级处理：提示用户手动选择
        openAlertDialog('您的浏览器不支持目录选择。请在下方输入框中手动输入导出路径。');
      }
    } catch (error) {
      console.log('用户取消了目录选择');
    }
  };

  const updateGroupName = (groupId: string, newName: string) => {
    const updatedGroups = categoryGroups.map(group =>
      group.id === groupId ? { ...group, name: newName } : group
    );
    onUpdateCategoryGroups(updatedGroups);
    setEditingGroup(null);
  };

  const addSubcategory = (groupId: string, subcategory: string) => {
    const updatedGroups = categoryGroups.map(group =>
      group.id === groupId 
        ? { ...group, subcategories: [...group.subcategories, subcategory] }
        : group
    );
    onUpdateCategoryGroups(updatedGroups);
  };

  const removeSubcategory = (groupId: string, subcategory: string) => {
    const updatedGroups = categoryGroups.map(group =>
      group.id === groupId 
        ? { ...group, subcategories: group.subcategories.filter(sub => sub !== subcategory) }
        : group
    );
    onUpdateCategoryGroups(updatedGroups);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">系统设置</h2>
        <p className="text-gray-600">配置应用程序的行为和数据管理选项</p>
      </div>

      {/* 用户资料 */}
      {user && (
        <div className="mb-6">
          <UserProfile user={user} onUpdateProfile={onUpdateProfile} onLogout={onLogout} />
        </div>
      )}

      {/* 文件存储设置 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-600" />
          文件存储设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认导出路径
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={exportPath}
                onChange={handlePathChange}
                placeholder="选择或输入文件保存路径..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleDirectorySelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                选择目录
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              注意：由于浏览器安全限制，文件仍会下载到默认下载文件夹
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoExport"
              checked={autoExport}
              onChange={(e) => setAutoExport(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoExport" className="text-sm text-gray-700">
              启用自动导出
            </label>
          </div>

          {autoExport && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                导出频率
              </label>
              <select
                value={exportInterval}
                onChange={(e) => setExportInterval(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 分类管理 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-purple-600" />
          分类管理
        </h3>
        
        <div className="space-y-4">
          {categoryGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                {editingGroup === group.id ? (
                  <input
                    type="text"
                    defaultValue={group.name}
                    onBlur={(e) => updateGroupName(group.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateGroupName(group.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="text-lg font-medium bg-blue-50 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <h4 className="text-lg font-medium text-gray-800">{group.name}</h4>
                )}
                <button
                  onClick={() => setEditingGroup(editingGroup === group.id ? null : group.id)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {editingGroup === group.id ? '完成' : '编辑'}
                </button>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">子分类:</h5>
                <div className="flex flex-wrap gap-2">
                  {group.subcategories.map((subcategory) => (
                    <div key={subcategory} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm text-gray-700">{subcategory}</span>
                      <button
                        onClick={() => removeSubcategory(group.id, subcategory)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      openPromptDialog(
                        '输入新的子分类名称:',
                        (newSubcategory) => {
                          addSubcategory(group.id, newSubcategory);
                        },
                        undefined,
                        '',
                        '子分类名称'
                      );
                    }}
                    className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-sm">添加</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-600" />
          数据统计
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.memories.length}</div>
            <div className="text-sm text-gray-600">记忆条目</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{categoryGroups.length}</div>
            <div className="text-sm text-gray-600">分类组</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {categoryGroups.reduce((total, group) => total + group.subcategories.length, 0)}
            </div>
            <div className="text-sm text-gray-600">子分类</div>
          </div>
        </div>
      </div>

      {/* 数据导出 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-orange-600" />
          数据导出
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            导出所有数据为TXT格式文件，文件名格式：全部数据导出—时间戳.txt
          </p>
          <button
            onClick={() => {
              downloadAllDataTxtFile(data);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            导出全部数据
          </button>
        </div>
      </div>

      {/* 应用信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">应用信息</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>版本</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>数据存储</span>
            <span>浏览器本地存储</span>
          </div>
          <div className="flex justify-between">
            <span>最后更新</span>
            <span>{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}