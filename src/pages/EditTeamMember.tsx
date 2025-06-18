import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Save, X, AlertCircle, User, Calendar, Image, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role_ko: string;
  role_en: string;
  role_ja: string;
  description_ko: string;
  description_en: string;
  description_ja: string;
  avatar_url: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name_ko: string;
  name_en: string;
  name_ja: string;
}

interface ProjectAssignment {
  project_id: string;
  role_ko: string;
  role_en: string;
  role_ja: string;
  is_lead: boolean;
}

const EditTeamMember = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const content = {
    ko: {
      title: '팀원 수정',
      name: '이름',
      role: '역할',
      description: '소개',
      profileImage: '프로필 이미지',
      sortOrder: '정렬 순서',
      active: '활성',
      save: '저장',
      cancel: '취소',
      saveError: '저장 중 오류가 발생했습니다.',
      loadError: '팀원 정보를 불러오는 중 오류가 발생했습니다.',
      unauthorized: '관리자 권한이 필요합니다.',
      roleKo: '한국어 역할',
      roleEn: '영어 역할',
      roleJa: '일본어 역할',
      descriptionKo: '한국어 소개',
      descriptionEn: '영어 소개',
      descriptionJa: '일본어 소개',
      projectAssignments: '프로젝트 할당',
      project: '프로젝트',
      projectRole: '역할',
      isLead: '리드',
      addProject: '프로젝트 추가',
      removeProject: '제거'
    },
    en: {
      title: 'Edit Team Member',
      name: 'Name',
      role: 'Role',
      description: 'Description',
      profileImage: 'Profile Image',
      sortOrder: 'Sort Order',
      active: 'Active',
      save: 'Save',
      cancel: 'Cancel',
      saveError: 'Error saving changes.',
      loadError: 'Error loading team member.',
      unauthorized: 'Admin access required.',
      roleKo: 'Korean Role',
      roleEn: 'English Role',
      roleJa: 'Japanese Role',
      descriptionKo: 'Korean Description',
      descriptionEn: 'English Description',
      descriptionJa: 'Japanese Description',
      projectAssignments: 'Project Assignments',
      project: 'Project',
      projectRole: 'Role',
      isLead: 'Lead',
      addProject: 'Add Project',
      removeProject: 'Remove'
    },
    ja: {
      title: 'チームメンバー編集',
      name: '名前',
      role: '役割',
      description: '紹介',
      profileImage: 'プロフィール画像',
      sortOrder: 'ソート順',
      active: 'アクティブ',
      save: '保存',
      cancel: 'キャンセル',
      saveError: '保存中にエラーが発生しました。',
      loadError: 'チームメンバーの読み込み中にエラーが発生しました。',
      unauthorized: '管理者権限が必要です。',
      roleKo: '韓国語役割',
      roleEn: '英語役割',
      roleJa: '日本語役割',
      descriptionKo: '韓国語紹介',
      descriptionEn: '英語紹介',
      descriptionJa: '日本語紹介',
      projectAssignments: 'プロジェクト割り当て',
      project: 'プロジェクト',
      projectRole: '役割',
      isLead: 'リード',
      addProject: 'プロジェクト追加',
      removeProject: '削除'
    }
  };

  const t = content[language];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/team');
      return;
    }
    
    if (id) {
      fetchMember();
    }
  }, [isAdmin, id]);

  const fetchMember = async () => {
    try {
      // Fetch team member
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (memberError) throw memberError;
      
      // Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name_ko');
      
      if (projectsError) throw projectsError;
      
      // Fetch member's project assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('team_member_projects')
        .select('*')
        .eq('team_member_id', id);
      
      if (assignmentsError) throw assignmentsError;
      
      setMember(memberData);
      setFormData(memberData);
      setProjects(projectsData || []);
      setProjectAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Remove fields that shouldn't be updated
      const updateData = { ...formData };
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      console.log('Updating team member with data:', updateData);

      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Update project assignments
      // First, delete all existing assignments
      await supabase
        .from('team_member_projects')
        .delete()
        .eq('team_member_id', id);

      // Then insert new assignments
      if (projectAssignments.length > 0) {
        const assignmentsToInsert = projectAssignments.map(assignment => ({
          team_member_id: id,
          project_id: assignment.project_id,
          role_ko: assignment.role_ko,
          role_en: assignment.role_en,
          role_ja: assignment.role_ja,
          is_lead: assignment.is_lead
        }));

        const { error: assignmentError } = await supabase
          .from('team_member_projects')
          .insert(assignmentsToInsert);

        if (assignmentError) {
          console.error('Error updating project assignments:', assignmentError);
          throw assignmentError;
        }
      }

      console.log('Update successful:', data);
      navigate('/team');
    } catch (error: any) {
      console.error('Error updating team member:', error);
      setError(`${t.saveError} ${error.message || ''}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectAssignmentChange = (index: number, field: string, value: any) => {
    const updated = [...projectAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setProjectAssignments(updated);
  };

  const addProjectAssignment = () => {
    setProjectAssignments([...projectAssignments, {
      project_id: '',
      role_ko: '',
      role_en: '',
      role_ja: '',
      is_lead: false
    }]);
  };

  const removeProjectAssignment = (index: number) => {
    setProjectAssignments(projectAssignments.filter((_, i) => i !== index));
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{t.unauthorized}</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl">{t.loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={t.title + ' | SayBerry Games'} />
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-6">
                <div>
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {formData.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    <Image className="inline h-4 w-4 mr-2" />
                    {t.profileImage}
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url || ''}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.name}</h3>
              <div>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="베리"
                  required
                />
              </div>
            </div>

            {/* Roles */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.role}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleKo}</label>
                  <input
                    type="text"
                    value={formData.role_ko || ''}
                    onChange={(e) => handleInputChange('role_ko', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleEn}</label>
                  <input
                    type="text"
                    value={formData.role_en || ''}
                    onChange={(e) => handleInputChange('role_en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.roleJa}</label>
                  <input
                    type="text"
                    value={formData.role_ja || ''}
                    onChange={(e) => handleInputChange('role_ja', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{t.description}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.descriptionKo}</label>
                  <textarea
                    value={formData.description_ko || ''}
                    onChange={(e) => handleInputChange('description_ko', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.descriptionEn}</label>
                  <textarea
                    value={formData.description_en || ''}
                    onChange={(e) => handleInputChange('description_en', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.descriptionJa}</label>
                  <textarea
                    value={formData.description_ja || ''}
                    onChange={(e) => handleInputChange('description_ja', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Project Assignments */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{t.projectAssignments}</h3>
                <button
                  type="button"
                  onClick={addProjectAssignment}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  <Plus className="h-4 w-4" />
                  {t.addProject}
                </button>
              </div>
              
              <div className="space-y-4">
                {projectAssignments.map((assignment, index) => (
                  <div key={index} className="border border-gray-700 rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium">{t.project} #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeProjectAssignment(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">{t.project}</label>
                        <select
                          value={assignment.project_id}
                          onChange={(e) => handleProjectAssignmentChange(index, 'project_id', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                        >
                          <option value="">선택하세요</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {language === 'ko' ? project.name_ko : 
                               language === 'ja' ? project.name_ja : 
                               project.name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={assignment.is_lead}
                            onChange={(e) => handleProjectAssignmentChange(index, 'is_lead', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{t.isLead}</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">{t.roleKo}</label>
                        <input
                          type="text"
                          value={assignment.role_ko}
                          onChange={(e) => handleProjectAssignmentChange(index, 'role_ko', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                          placeholder="예: 클라이언트 개발"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{t.roleEn}</label>
                        <input
                          type="text"
                          value={assignment.role_en}
                          onChange={(e) => handleProjectAssignmentChange(index, 'role_en', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                          placeholder="e.g. Client Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{t.roleJa}</label>
                        <input
                          type="text"
                          value={assignment.role_ja}
                          onChange={(e) => handleProjectAssignmentChange(index, 'role_ja', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                          placeholder="例: クライアント開発"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {projectAssignments.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {language === 'ko' ? '프로젝트 할당이 없습니다.' : 
                     language === 'ja' ? 'プロジェクト割り当てがありません。' : 
                     'No project assignments.'}
                  </p>
                )}
              </div>
            </div>

            {/* Other Settings */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.sortOrder}</label>
                  <input
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active !== undefined ? formData.active : true}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>{t.active}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md transition-colors"
              >
                <Save className="h-5 w-5" />
                {saving ? '저장 중...' : t.save}
              </button>
              <button
                type="button"
                onClick={() => navigate('/team')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditTeamMember;