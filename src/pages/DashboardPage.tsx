import CreateGameButton from '../components/dashboard/CreateGameButton';

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">대시보드</h1>
      <CreateGameButton />
    </div>
  );
}
