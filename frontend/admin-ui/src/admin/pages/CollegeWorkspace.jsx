import { useParams } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';

export default function CollegeWorkspace() {
  const { collegeId } = useParams();

  return <AdminDashboardPage collegeId={collegeId} />;
}
