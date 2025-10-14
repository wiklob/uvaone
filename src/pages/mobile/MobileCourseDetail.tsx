import { useParams } from 'react-router-dom';
import CourseDetail from '../CourseDetail';
import MobileLayout from '../../components/mobile/MobileLayout';

export default function MobileCourseDetail() {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const selectedTab = tab || 'overview';

  return (
    <MobileLayout
      showTopTabBar={true}
      selectedTab={selectedTab}
      courseId={id}
    >
      {/* Render desktop CourseDetail component - it already has all the logic */}
      <CourseDetail />
    </MobileLayout>
  );
}
