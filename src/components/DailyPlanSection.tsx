import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import { DailyPlan, Task } from '../types';

interface DailyPlanSectionProps {
  dailyPlans: DailyPlan[];
  onAdd: (plan: Omit<DailyPlan, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, plan: Partial<DailyPlan>) => void;
}

export default function DailyPlanSection({ dailyPlans, onAdd, onUpdate }: DailyPlanSectionProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddTask, setShowAddTask] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayPlan = dailyPlans.find(plan => plan.date === today);
  const yesterdayPlan = dailyPlans.find(plan => plan.date === yesterday);
  const selectedPlan = dailyPlans.find(plan => plan.date === selectedDate);

  const createNewPlan = () => {
    const newPlan: Omit<DailyPlan, 'id' | 'createdAt'> = {
      date: selectedDate,
      tasks: [],
      reflections: '',
      tomorrowPlans: []
    };
    onAdd(newPlan);
  };

  const addTask = (planId: string, taskTitle: string, priority: Task['priority']) => {
    const plan = dailyPlans.find(p => p.id === planId);
    if (!plan) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      priority
    };

    onUpdate(planId, {
      tasks: [...plan.tasks, newTask]
    });
  };

  const toggleTask = (planId: string, taskId: string) => {
    const plan = dailyPlans.find(p => p.id === planId);
    if (!plan) return;

    const updatedTasks = plan.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    onUpdate(planId, { tasks: updatedTasks });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">每日计划</h2>
        <p className="text-gray-600">管理日常任务，回顾昨天，规划明天</p>
      </div>

      {/* 今日提醒 */}
      {yesterdayPlan?.tomorrowReminders && yesterdayPlan.tomorrowReminders.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">📢 今日提醒</h3>
          <div className="space-y-2">
            {yesterdayPlan.tomorrowReminders.map((reminder, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                <p className="text-gray-800">{reminder}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 三日视图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 昨天回顾 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            昨天回顾
          </h3>
          {yesterdayPlan ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                完成任务: {yesterdayPlan.tasks.filter(t => t.completed).length} / {yesterdayPlan.tasks.length}
              </div>
              {yesterdayPlan.reflections && (
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">反思总结</h4>
                  <p className="text-sm text-gray-600">{yesterdayPlan.reflections}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无昨日记录</p>
          )}
        </div>

        {/* 今天计划 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            今天计划
          </h3>
          {todayPlan ? (
            <div className="space-y-3">
              {todayPlan.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                  <button
                    onClick={() => toggleTask(todayPlan.id, task.id)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <Circle className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
              ))}
              {showAddTask && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    addTask(todayPlan.id, formData.get('title') as string, formData.get('priority') as Task['priority']);
                    setShowAddTask(false);
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="bg-white p-3 rounded-lg space-y-2"
                >
                  <input
                    name="title"
                    type="text"
                    placeholder="任务内容..."
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <select
                      name="priority"
                      className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="medium">中等优先级</option>
                      <option value="high">高优先级</option>
                      <option value="low">低优先级</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      添加
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
              <button
                onClick={() => setShowAddTask(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加任务
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">今天还没有计划</p>
              <button
                onClick={createNewPlan}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                创建今日计划
              </button>
            </div>
          )}
        </div>

        {/* 明天规划 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            明天规划
          </h3>
          {todayPlan?.tomorrowPlans.length ? (
            <div className="space-y-2">
              {todayPlan.tomorrowPlans.map((plan, index) => (
                <div key={index} className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{plan}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无明日规划</p>
          )}
        </div>
      </div>

      {/* 历史计划查看 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">历史计划</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {selectedPlan ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">任务完成情况</h4>
              <div className="space-y-2">
                {selectedPlan.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {task.completed ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <Circle className="w-5 h-5 text-gray-400" />
                    }
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">明日提醒 (每行一个)</label>
              <textarea
                name="tomorrowReminders"
                rows={2}
                placeholder="重要提醒事项...&#10;提醒1&#10;提醒2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {selectedPlan.reflections && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">反思总结</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedPlan.reflections}</p>
                </div>
              </div>
            )}
            
            {selectedPlan.tomorrowReminders && selectedPlan.tomorrowReminders.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">明日提醒</h4>
                <div className="space-y-2">
                  {selectedPlan.tomorrowReminders.map((reminder, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-gray-700">{reminder}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">选择日期查看历史计划</p>
        )}
      </div>
    </div>
  );
}