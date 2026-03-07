import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentModulesPage } from './pages/StudentModulesPage';
import { ModuleLearningPage } from './pages/ModuleLearningPage';
import { QuizPage } from './pages/QuizPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminModuleEditor } from './pages/AdminModuleEditor';
import { AdminModulesPage } from './pages/AdminModulesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLiveSessions } from './pages/AdminLiveSessions';
import { StudentLiveClass } from './pages/StudentLiveClass';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import './lib/i18n';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/modules" element={<StudentModulesPage />} />
          <Route path="/student/modules/:id" element={<ModuleLearningPage />} />
          <Route path="/student/quiz/:id" element={<QuizPage />} />
          <Route path="/student/live-class" element={<StudentLiveClass />} />
          <Route path="/student/analytics" element={<AnalyticsPage />} />
          <Route path="/student/leaderboard" element={<LeaderboardPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/modules" element={<AdminModulesPage />} />
          <Route path="/admin/create" element={<AdminModuleEditor />} />
          <Route path="/admin/edit/:id" element={<AdminModuleEditor />} />
          <Route path="/admin/live-sessions" element={<AdminLiveSessions />} />
          <Route path="/admin/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
          <Route path="/profile" element={<div className="p-8">Shared Profile Page</div>} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
