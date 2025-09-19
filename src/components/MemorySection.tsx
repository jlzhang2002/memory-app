import React, { useState } from 'react';
import { Calendar, Edit3, Eye, Save, X } from 'lucide-react';
import { Memory, CategoryGroup } from '../types';

interface MemorySectionProps {
  memories: Memory[];
  onAdd: (memory: Omit<Memory, 'id' | 'createdAt' | 'lastModified'>) => void;
  onEdit: (id: string, memory: Partial<Memory>) => void;
  showForm: boolean;
  onToggleForm: () => void;
  searchTerm: string;
  selectedCategory: string;
  categoryGroups: CategoryGroup[];
}

export default function MemorySection({ 
  memories, 
  onAdd, 
  onEdit, 
  showForm, 
  onToggleForm,
  searchTerm,
  selectedCategory,
  categoryGroups
}: MemorySectionProps) {
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Memory>>({});

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || memory.subCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canEditMemory = (memory: Memory) => {
    const today = new Date().toISOString().split('T')[0];
    const memoryDate = memory.date;
    return memoryDate === today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const memory: Omit<Memory, 'id' | 'createdAt' | 'lastModified'> = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      mainCategory: formData.get('mainCategory') as string,
      subCategory: formData.get('subCategory') as string,
      date: formData.get('date') as string,
      importance: parseInt(formData.get('importance') as string) || 3,
      tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(tag => tag),
      emotions: (formData.get('emotions') as string || '').split(',').map(emotion => emotion.trim()).filter(emotion => emotion),
    };
    onAdd(memory);
    onToggleForm();
    (e.target as HTMLFormElement).reset();
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory.id);
    setEditForm({
      title: memory.title,
      content: memory.content,
      mainCategory: memory.mainCategory,
      subCategory: memory.subCategory,
      importance: memory.importance,
      tags: memory.tags,
      emotions: memory.emotions
    });
  };

  const handleSaveEdit = () => {
    if (editingMemory && editForm) {
      onEdit(editingMemory, {
        ...editForm,
        lastModified: new Date().toISOString()
      });
      setEditingMemory(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingMemory(null);
    setEditForm({});
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">记忆库</h2>
        <p className="text-gray-600">记录重要的记忆和经历，按分类整理</p>
      </div>

      {/* Add Memory Form */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">添加新记忆</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
              <textarea
                name="content"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">重要性 (1-5)</label>
                <input
                  name="importance"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主分类</label>
                <select
                  name="mainCategory"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryGroups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">子分类</label>
                <input
                  name="subCategory"
                  type="text"
                  required
                  placeholder="输入或选择子分类"
                  list="subcategories"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="subcategories">
                  {categoryGroups.flatMap(group => 
                    group.subcategories.map(sub => (
                      <option key={sub} value={sub} />
                    ))
                  )}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签 (用逗号分隔)</label>
              <input
                name="tags"
                type="text"
                placeholder="标签1, 标签2, 标签3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">情感 (用逗号分隔)</label>
              <input
                name="emotions"
                type="text"
                placeholder="开心, 兴奋, 感动"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
              <button
                type="button"
                onClick={onToggleForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Memory Cards */}
      <div className="grid gap-4">
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {editingMemory === memory.id ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full text-lg font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editForm.importance || 3}
                    onChange={(e) => setEditForm({...editForm, importance: parseInt(e.target.value)})}
                    placeholder="重要性 (1-5)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editForm.mainCategory || ''}
                    onChange={(e) => setEditForm({...editForm, mainCategory: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryGroups.map(group => (
                      <option key={group.id} value={group.name}>{group.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editForm.subCategory || ''}
                    onChange={(e) => setEditForm({...editForm, subCategory: e.target.value})}
                    placeholder="子分类"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.tags?.join(', ') || ''}
                    onChange={(e) => setEditForm({...editForm, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    placeholder="标签 (用逗号分隔)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editForm.emotions?.join(', ') || ''}
                    onChange={(e) => setEditForm({...editForm, emotions: e.target.value.split(',').map(emotion => emotion.trim()).filter(emotion => emotion)})}
                    placeholder="情感 (用逗号分隔)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{memory.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {'★'.repeat(memory.importance)}{'☆'.repeat(5 - memory.importance)}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {memory.mainCategory} / {memory.subCategory}
                    </span>
                    {canEditMemory(memory) && (
                      <button
                        onClick={() => handleEdit(memory)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        编辑
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{memory.content}</p>
                {((memory.tags && memory.tags.length > 0) || (memory.emotions && memory.emotions.length > 0)) && (
                  <div className="mb-4 space-y-2">
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm text-gray-600">标签:</span>
                        {memory.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {memory.emotions && memory.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm text-gray-600">情感:</span>
                        {memory.emotions.map((emotion, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {memory.date}
                  </div>
                  {memory.lastModified && (
                    <div className="flex items-center gap-1">
                      <Edit3 className="w-4 h-4" />
                      最后修改: {new Date(memory.lastModified).toLocaleDateString('zh-CN')}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {filteredMemories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || selectedCategory !== 'all' ? '没有找到匹配的记忆' : '还没有记忆记录'}
          </div>
        )}
      </div>
    </div>
  );
}