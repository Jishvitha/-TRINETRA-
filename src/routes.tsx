import LoginSelection from './pages/LoginSelection';
import PoliceLogin from './pages/PoliceLogin';
import CitizenLogin from './pages/CitizenLogin';
import PoliceDashboard from './pages/PoliceDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login Selection',
    path: '/',
    element: <LoginSelection />
  },
  {
    name: 'Police Login',
    path: '/police-login',
    element: <PoliceLogin />
  },
  {
    name: 'Citizen Login',
    path: '/citizen-login',
    element: <CitizenLogin />
  },
  {
    name: 'Police Dashboard',
    path: '/police-dashboard',
    element: <PoliceDashboard />
  },
  {
    name: 'Citizen Dashboard',
    path: '/citizen-dashboard',
    element: <CitizenDashboard />
  }
];

export default routes;
