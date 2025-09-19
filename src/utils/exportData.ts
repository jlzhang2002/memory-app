import { Memory, Thought, Observation, Person, SocialRecord, Evaluation } from '../types';

export interface ExportData {
  memories: Memory[];
  thoughts: Thought[];
  observations: Observation[];
  people: Person[];
  socialRecords: SocialRecord[];
  evaluations: Evaluation[];
}

export function formatDataAsTxt(data: ExportData): string {
  const lines: string[] = [];
  
  // Header
  lines.push('='.repeat(60));
  lines.push('个人记忆与关系管理系统 - 数据导出');
  lines.push(`导出时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('='.repeat(60));
  lines.push('');

  // Memories Section
  if (data.memories.length > 0) {
    lines.push('📚 记忆库');
    lines.push('-'.repeat(40));
    data.memories.forEach((memory, index) => {
      lines.push(`${index + 1}. ${memory.title}`);
      lines.push(`   日期: ${memory.date}`);
      lines.push(`   分类: ${memory.mainCategory} / ${memory.subCategory}`);
      lines.push(`   重要性: ${'★'.repeat(memory.importance || 3)}${'☆'.repeat(5 - (memory.importance || 3))}`);
      if (memory.tags && memory.tags.length > 0) {
        lines.push(`   标签: ${memory.tags.join(', ')}`);
      }
      if (memory.emotions && memory.emotions.length > 0) {
        lines.push(`   情感: ${memory.emotions.join(', ')}`);
      }
      lines.push(`   内容: ${memory.content}`);
      lines.push(`   创建时间: ${new Date(memory.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // Thoughts Section
  if (data.thoughts.length > 0) {
    lines.push('🧠 思考记录');
    lines.push('-'.repeat(40));
    data.thoughts.forEach((thought, index) => {
      lines.push(`${index + 1}. ${thought.title}`);
      lines.push(`   日期: ${thought.date}`);
      lines.push(`   背景: ${thought.context}`);
      lines.push(`   思考内容: ${thought.content}`);
      if (thought.process.length > 0) {
        lines.push(`   思考过程:`);
        thought.process.forEach((step, stepIndex) => {
          lines.push(`     ${stepIndex + 1}. ${step}`);
        });
      }
      lines.push(`   结论: ${thought.conclusion}`);
      lines.push(`   创建时间: ${new Date(thought.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // Observations Section
  if (data.observations.length > 0) {
    lines.push('👁️ 观察日志');
    lines.push('-'.repeat(40));
    data.observations.forEach((observation, index) => {
      lines.push(`${index + 1}. ${observation.subject}`);
      lines.push(`   日期: ${observation.date}`);
      lines.push(`   状态: ${getStatusLabel(observation.status)}`);
      lines.push(`   分类: ${getObservationCategoryLabel(observation.category)}`);
      lines.push(`   描述: ${observation.description}`);
      if (observation.changes.length > 0) {
        lines.push(`   变化记录:`);
        observation.changes.forEach((change, changeIndex) => {
          lines.push(`     • ${change}`);
        });
      }
      if (observation.nextCheck) {
        lines.push(`   下次检查: ${observation.nextCheck}`);
      }
      lines.push(`   创建时间: ${new Date(observation.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // People Section
  if (data.people.length > 0) {
    lines.push('👥 关系网络');
    lines.push('-'.repeat(40));
    data.people.forEach((person, index) => {
      lines.push(`${index + 1}. ${person.name}`);
      lines.push(`   关系: ${person.relationship}`);
      lines.push(`   亲密度: ${'❤️'.repeat(person.closeness)}${'🤍'.repeat(5 - person.closeness)} (${person.closeness}/5)`);
      if (person.traits.length > 0) {
        lines.push(`   特质: ${person.traits.join(', ')}`);
      }
      lines.push(`   最后联系: ${person.lastContact}`);
      if (person.notes) {
        lines.push(`   备注: ${person.notes}`);
      }
      lines.push(`   创建时间: ${new Date(person.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // Social Records Section
  if (data.socialRecords.length > 0) {
    lines.push('💬 社交记录');
    lines.push('-'.repeat(40));
    data.socialRecords.forEach((record, index) => {
      lines.push(`${index + 1}. 与 ${record.personName} 的${getSocialTypeLabel(record.type)}`);
      lines.push(`   日期: ${record.date}`);
      lines.push(`   心情: ${getMoodLabel(record.mood)}`);
      if (record.duration) {
        lines.push(`   时长: ${record.duration}`);
      }
      lines.push(`   内容: ${record.description}`);
      if (record.context) {
        lines.push(`   背景: ${record.context}`);
      }
      if (record.insights.length > 0) {
        lines.push(`   洞察收获:`);
        record.insights.forEach((insight) => {
          lines.push(`     • ${insight}`);
        });
      }
      lines.push(`   创建时间: ${new Date(record.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // Evaluations Section
  if (data.evaluations.length > 0) {
    lines.push('📊 评价分析');
    lines.push('-'.repeat(40));
    data.evaluations.forEach((evaluation, index) => {
      lines.push(`${index + 1}. ${evaluation.title}`);
      lines.push(`   日期: ${evaluation.date}`);
      lines.push(`   对象: ${evaluation.subject}`);
      lines.push(`   分类: ${getEvaluationCategoryLabel(evaluation.category)}`);
      lines.push(`   评分: ${evaluation.rating}/10 (${getRatingLabel(evaluation.rating)})`);
      if (evaluation.criteria.length > 0) {
        lines.push(`   评价标准: ${evaluation.criteria.join(', ')}`);
      }
      lines.push(`   说明: ${evaluation.notes}`);
      if (evaluation.improvements.length > 0) {
        lines.push(`   改进建议:`);
        evaluation.improvements.forEach((improvement) => {
          lines.push(`     • ${improvement}`);
        });
      }
      lines.push(`   创建时间: ${new Date(evaluation.createdAt).toLocaleString('zh-CN')}`);
      lines.push('');
    });
    lines.push('');
  }

  // Footer
  lines.push('='.repeat(60));
  lines.push('数据导出完成');
  lines.push('='.repeat(60));

  return lines.join('\n');
}

export function downloadTxtFile(content: string, mainCategory: string, subCategory: string) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${mainCategory}—${subCategory}—${timestamp}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAllDataTxtFile(data: ExportData) {
  const content = formatDataAsTxt(data);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `全部数据导出—${timestamp}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper functions for labels

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ongoing: '进行中',
    resolved: '已解决',
    monitoring: '监控中',
    critical: '紧急'
  };
  return labels[status] || status;
}

function getObservationCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    health: '健康',
    work: '工作',
    environment: '环境',
    relationships: '关系',
    habits: '习惯',
    other: '其他'
  };
  return labels[category] || category;
}

function getSocialTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    meeting: '会面',
    call: '通话',
    message: '消息',
    email: '邮件',
    event: '活动',
    other: '其他'
  };
  return labels[type] || type;
}

function getMoodLabel(mood: string): string {
  const labels: Record<string, string> = {
    positive: '积极 😊',
    neutral: '中性 😐',
    negative: '消极 😔'
  };
  return labels[mood] || mood;
}

function getEvaluationCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    self: '自我评价',
    relationship: '关系评价',
    situation: '情况评价',
    decision: '决策评价',
    other: '其他'
  };
  return labels[category] || category;
}

function getRatingLabel(rating: number): string {
  if (rating >= 9) return '优秀';
  if (rating >= 7) return '良好';
  if (rating >= 5) return '一般';
  if (rating >= 3) return '较差';
  return '很差';
}