import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/components/ThemeProvider';
import GuestGate from '@/components/GuestGate';

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Shell = lazy(() => import('@/components/study/Shell'));
const Today = lazy(() => import('@/pages/Today'));
const Learn = lazy(() => import('@/pages/Learn'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const AskAI = lazy(() => import('@/pages/AskAI'));
const Notes = lazy(() => import('@/pages/Notes'));
const Materials = lazy(() => import('@/pages/Materials'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Progress = lazy(() => import('@/pages/Progress'));
const Profile = lazy(() => import('@/pages/Profile'));
const ShareApp = lazy(() => import('@/pages/ShareApp'));
const AddFriends = lazy(() => import('@/pages/AddFriends'));
const QuestionPapers = lazy(() => import('@/pages/QuestionPapers'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Flashcards = lazy(() => import('@/pages/Flashcards'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Revision = lazy(() => import('@/pages/Revision'));

const SuspenseFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route element={<Shell />}>
            <Route path="/learn" element={<Learn />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/material" element={<Materials />} />
            <Route path="/share" element={<ShareApp />} />
            <Route path="/friends" element={<AddFriends />} />
            <Route path="/papers" element={<QuestionPapers />} />
            <Route element={<GuestGate />}>
              <Route path="/" element={<Today />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/ask-ai" element={<AskAI />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/revision" element={<Revision />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App