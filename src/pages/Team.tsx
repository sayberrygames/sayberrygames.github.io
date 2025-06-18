import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { teamTranslations } from '../translations/team';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

interface TeamMember {
  id: string;
  name: string;
  role_ko: string;
  role_en: string;
  role_ja: string;
  description_ko: string | null;
  description_en: string | null;
  description_ja: string | null;
  avatar_url: string | null;
  sort_order: number;
  active: boolean;
  projects?: ProjectAssignment[];
}

interface ProjectAssignment {
  project_id: string;
  role_in_project: string;
  is_lead: boolean;
  project: {
    id: string;
    slug: string;
    name_ko: string;
    name_en: string;
    name_ja: string;
  };
}

const Team = () => {
  const { language } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const content = teamTranslations[language];
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team_member_projects!inner(
            project_id,
            role_in_project,
            is_lead,
            projects!inner(
              id,
              slug,
              name_ko,
              name_en,
              name_ja
            )
          )
        `)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Transform the data structure
      const transformedData = (data || []).map(member => ({
        ...member,
        projects: member.team_member_projects?.map((tmp: any) => ({
          project_id: tmp.project_id,
          role_in_project: tmp.role_in_project,
          is_lead: tmp.is_lead,
          project: tmp.projects
        })) || []
      }));
      
      setMembers(transformedData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRole = (member: TeamMember) => {
    return member[`role_${language}`] || member.role_en;
  };

  const getDescription = (member: TeamMember) => {
    return member[`description_${language}`] || '';
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const { isAdmin } = useAuth();
  const canManageTeam = isAdmin;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={content.title + ' | SayBerry Games'} 
        description={content.subtitle}
      />
      <section className="py-20 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-4"
            >
              {content.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400"
            >
              {content.subtitle}
            </motion.p>
          </div>

          {canManageTeam && (
            <div className="mb-8 flex justify-end gap-4">
              <button
                onClick={() => navigate('/admin/team')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>{language === 'ko' ? '팀관리' : language === 'ja' ? 'チーム管理' : 'Manage Team'}</span>
              </button>
              <button
                onClick={() => navigate('/admin/team/new')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{language === 'ko' ? '팀원 추가' : language === 'ja' ? 'メンバー追加' : 'Add Member'}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors relative group"
              >
                {canManageTeam && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/admin/team/edit/${member.id}`)}
                      className="p-2 hover:bg-gray-700 rounded mr-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('정말 삭제하시겠습니까?')) {
                          await supabase
                            .from('team_members')
                            .update({ active: false })
                            .eq('id', member.id);
                          fetchTeamMembers();
                        }
                      }}
                      className="p-2 hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold mb-4">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                  <p className="text-gray-400 mb-2">{getRole(member)}</p>
                  
                  {/* Project assignments */}
                  {member.projects && member.projects.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {member.projects.map((assignment) => (
                        <div key={assignment.project_id} className="flex items-center justify-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                            {language === 'ko' ? assignment.project.name_ko : 
                             language === 'ja' ? assignment.project.name_ja : 
                             assignment.project.name_en}
                          </span>
                          <span className="text-xs text-gray-500">
                            {language === 'ko' ? assignment.role_ko : 
                             language === 'ja' ? assignment.role_ja : 
                             assignment.role_en}
                          </span>
                          {assignment.is_lead && (
                            <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-500 rounded">
                              Lead
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {getDescription(member) && (
                    <p className="text-gray-500 text-sm">{getDescription(member)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {language === 'ko' ? '팀원 정보가 없습니다.' : 
                 language === 'ja' ? 'チームメンバーがいません。' : 
                 'No team members found.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Team;