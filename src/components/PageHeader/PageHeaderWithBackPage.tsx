// TEST ONLY - remove after Phase 0
import { useNavigate } from 'react-router';
import { PageHeader } from './PageHeader';

export function PageHeaderWithBackPage() {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <PageHeader title="כותרת בדיקה" onBack={() => navigate(-1)} />
    </div>
  );
}
