import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Loader } from '@/components/common/Loader';
import {
  Home,
  BookOpen,
  FileText,
  Search
} from 'lucide-react';
import { Course } from '@/types/auth';
import { authAPI } from '@/services/api';
import { Input } from '@/components/ui/input';

export const StudentSidebar: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const loadCourses = useCallback(async () => {
    try {
      const coursesData = await authAPI.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    if (searchQuery.trim() === '') {
      return courses;
    }
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, courses]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      className={isCollapsed ? 'w-14' : 'w-80'}
      collapsible="icon"
    >
      <SidebarContent className="bg-card border-r">
        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive: routeIsActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        routeIsActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`
                    }
                  >
                    <Home className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Courses Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Available Courses
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="px-3">
                <Loader size="sm" text="Loading courses..." />
              </div>
            ) : (
              <SidebarMenu>
                {filteredCourses.length === 0 ? (
                  <div className={`px-3 py-2 text-sm text-muted-foreground ${isCollapsed ? 'sr-only' : ''}`}>
                    {searchQuery ? 'No courses found' : 'No courses available'}
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <SidebarMenuItem key={course.id}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={`/dashboard/course/${course.id}`}
                          className={({ isActive: routeIsActive }) =>
                            `flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                              routeIsActive
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`
                          }
                          title={isCollapsed ? course.title : undefined}
                        >
                          <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {course.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {course.pdfCount} files
                              </div>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default React.memo(StudentSidebar);