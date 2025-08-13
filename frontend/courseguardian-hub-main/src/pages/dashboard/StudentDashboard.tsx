import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StudentSidebar } from '@/components/dashboard/StudentSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { BookOpen, Clock, Award, TrendingUp, Loader2 } from 'lucide-react';

interface CourseWithProgress {
  id: number;
  title: string;
  lesson_count: number;
  completed_lessons: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await authAPI.getCourses();
        // For demo purposes, add some mock progress data
        const coursesWithProgress = coursesData.map(course => ({
          ...course,
          lesson_count: Math.floor(Math.random() * 10) + 1,
          completed_lessons: Math.floor(Math.random() * 8)
        }));
        setCourses(coursesWithProgress);
      } catch (err) {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading courses...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalCourses = courses.length;
  const totalLessons = courses.reduce((sum, course) => sum + course.lesson_count, 0);
  const completedLessons = courses.reduce((sum, course) => sum + course.completed_lessons, 0);
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-blue-50 mr-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCourses}</p>
                <p className="text-sm font-medium text-foreground">Available Courses</p>
                <p className="text-xs text-muted-foreground">Start learning today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-green-50 mr-4">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                <p className="text-sm font-medium text-foreground">Total Lessons</p>
                <p className="text-xs text-muted-foreground">Available materials</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-purple-50 mr-4">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedLessons}</p>
                <p className="text-sm font-medium text-foreground">Lessons Completed</p>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className="p-3 rounded-full bg-orange-50 mr-4">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{progressPercentage}%</p>
                <p className="text-sm font-medium text-foreground">Overall Progress</p>
                <p className="text-xs text-muted-foreground">Learning completion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>
              Available courses with study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.completed_lessons} of {course.lesson_count} lessons completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(course.completed_lessons / course.lesson_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-fit">
                      {Math.round((course.completed_lessons / course.lesson_count) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
              
              {courses.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No courses available</h3>
                  <p className="text-muted-foreground">Contact your administrator to get enrolled in courses.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;