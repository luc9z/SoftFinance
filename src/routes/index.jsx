import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Entrada from '../pages/Entrada';
import Meta from '../pages/Meta';
import Despesa from '../pages/Despesa';
import NotFound from '../pages/notFound';
import Login from '../pages/Login';
import MonthDetail from '../components/MonthDetail';

const RoutesApp = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/entrada" element={<Entrada />} />
      <Route path="/dashboard/meta" element={<Meta />} />
      <Route path="/dashboard/despesa" element={<Despesa />} />
      <Route path="/dashboard/:month/:year" element={<MonthDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesApp;
