import { Navbar } from "./components/Navbar";
import { HeroStats } from "./components/HeroStats";
import { PremiumChart } from "./components/PremiumChart";
import { CategoryList } from "./components/CategoryList";
import { RecentActivity } from "./components/RecentActivity";
import { AIInsights } from "./components/AIInsights";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-blue-100">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Track, analyze, and optimize your focus.</p>
        </div>

        {/* 4 Hero Cards */}
        <HeroStats />

{/* Main Visualization Area */}
  <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 mb-6">
    <div className="xl:col-span-7">
      <PremiumChart />
    </div>
    <div className="xl:col-span-3">
      <CategoryList />
    </div>
  </div>

{/* Lower Section */}
  <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
    <div className="xl:col-span-3">
      <RecentActivity />
    </div>
    <div className="xl:col-span-7">
      <AIInsights />
    </div>
  </div>
      </main>
    </div>
  );
}
