import DashboardLayout from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <p className="text-muted-foreground">Selamat datang di dashboard Anda.</p>
    </DashboardLayout>
  );
};

export default Dashboard;
