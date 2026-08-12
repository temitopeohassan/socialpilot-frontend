import { Link } from "react-router-dom";
import { Zap, Calendar, Sparkles, BarChart2, Users, Rss, CheckCircle, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Caption Generator", desc: "Generate captions, rewrites, hooks and hashtags using Claude AI." },
  { icon: Calendar, title: "Smart Scheduling", desc: "Schedule posts across all platforms with a drag-and-drop calendar." },
  { icon: Rss, title: "RSS Automation", desc: "Automatically post from any RSS feed to your social channels." },
  { icon: BarChart2, title: "Analytics", desc: "Track impressions, engagement, and publishing performance over time." },
  { icon: Users, title: "Team Workspaces", desc: "Manage multiple brands and clients with role-based access controls." },
  { icon: Zap, title: "Bulk Publishing", desc: "Upload and schedule dozens of posts at once from a CSV or form." },
];

const PLANS = [
  { name: "Starter", price: "$19", desc: "For solo creators", features: ["6 channels", "120 posts/month", "300 AI credits", "2 team members"] },
  { name: "Growth", price: "$39", desc: "Most popular", features: ["20 channels", "600 posts/month", "2,000 AI credits", "5 team members", "RSS automation"], popular: true },
  { name: "Agency", price: "$79", desc: "For agencies", features: ["Unlimited channels", "Unlimited posts", "Unlimited AI", "15 team members", "White-label ready"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="font-bold text-lg">SocialPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm">Sign in</Link>
          <Link to="/register" className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-600/20 text-violet-400 px-4 py-1.5 rounded-full text-sm mb-6">
          <Sparkles size={14} />
          Now with AI publishing workflows
        </div>
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          Plan, create, and publish<br />
          <span className="text-violet-400">faster with AI</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Schedule posts, generate captions, automate RSS feeds, manage your team, and track results — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl text-base font-semibold transition-colors">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="text-gray-400 hover:text-white px-6 py-3 text-base">
            Sign in →
          </Link>
        </div>
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
          <span>50K+ active users</span>
          <span>·</span>
          <span>99.9% uptime</span>
          <span>·</span>
          <span>4.9★ rating</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Everything your team needs</h2>
        <p className="text-gray-400 text-center mb-12">From drafting to scheduling to reporting, every module is built for daily publishing work.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors">
              <div className="w-10 h-10 bg-violet-600/10 rounded-lg flex items-center justify-center mb-3">
                <Icon size={20} className="text-violet-400" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-400 text-center mb-12">Scale as you grow. No hidden fees.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`bg-gray-900 border rounded-xl p-6 relative ${plan.popular ? "border-violet-500" : "border-gray-800"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-xs px-3 py-0.5 rounded-full font-medium">
                  Most popular
                </div>
              )}
              <p className="font-semibold text-lg">{plan.name}</p>
              <p className="text-xs text-gray-400 mb-4">{plan.desc}</p>
              <p className="text-4xl font-bold mb-1">{plan.price}</p>
              <p className="text-xs text-gray-500 mb-5">/month</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.popular ? "bg-violet-600 hover:bg-violet-500 text-white" : "border border-gray-700 hover:border-gray-600 text-gray-300"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-600">
        <p>© 2026 SocialPilot. Built with React + FastAPI.</p>
      </footer>
    </div>
  );
}
