import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Calendar,
  Sparkles,
  BarChart2,
  Users,
  Rss,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Link2,
  RefreshCw,
  Globe,
  TrendingUp,
  Clock,
  Brain,
} from "lucide-react";

const PAIN_POINTS = [
  {
    icon: AlertCircle,
    title: "Impressions aren't outcomes",
    desc: "Knowing 4,200 people saw a post tells you nothing about whether any of them became customers.",
  },
  {
    icon: Link2,
    title: "Social and web data never connect",
    desc: "Your analytics tools live in separate tabs. No one is joining the dots between what you publish and what converts.",
  },
  {
    icon: RefreshCw,
    title: "No feedback loop",
    desc: "Without knowing what actually worked, every campaign starts from guesswork instead of data.",
  },
];

const FLOW_STEPS = [
  {
    label: "Publish your content",
    desc: "SocialPilot automatically adds UTM attribution to every link in every post across all five platforms.",
  },
  {
    label: "Visitors land on your site",
    desc: "The tracking snippet captures the visit, the source post, the pages they viewed, and how long they stayed.",
  },
  {
    label: "Attribution is automatic",
    desc: "Signups, purchases, and conversions are tied back to the exact post that drove them — no manual work.",
  },
  {
    label: "Your next campaign gets smarter",
    desc: "Real engagement data feeds back into scheduling predictions. Every publish improves the next one.",
  },
];

const ANALYTICS_FEATURES = [
  {
    icon: BarChart2,
    color: "bg-violet-500",
    title: "Platform Analytics",
    desc: "Live engagement data pulled directly from LinkedIn, Instagram, Twitter/X, Facebook, and TikTok — not estimates. Impressions, reach, clicks, saves, shares, and engagement rate per post, per platform, per day.",
    badge: "Core",
  },
  {
    icon: Globe,
    color: "bg-blue-400",
    title: "Website Visitor Tracking",
    desc: "Add one snippet to your site and start seeing every visit, session, scroll depth, and time-on-page in real time. Works on any website — static, WordPress, Webflow, or React.",
    badge: "New",
  },
  {
    icon: Link2,
    color: "bg-emerald-400",
    title: "Social-to-Web Attribution",
    desc: "Every post SocialPilot publishes carries UTM parameters automatically. When a visitor arrives from one of your posts, it's attributed instantly — campaign, dwell time, and whether they converted.",
    badge: "New",
  },
  {
    icon: TrendingUp,
    color: "bg-amber-400",
    title: "Top Content Intelligence",
    desc: "See your highest-performing posts ranked by any metric — reach, clicks, engagement rate, or conversions driven. Understand what format, topic, and timing works for each platform.",
    badge: "Core",
  },
  {
    icon: Clock,
    color: "bg-purple-400",
    title: "Best-Time Prediction",
    desc: "SocialPilot learns from your own engagement history — not generic benchmarks — and predicts the optimal posting time per account.",
    badge: "Core",
  },
  {
    icon: Brain,
    color: "bg-pink-400",
    title: "Post Intelligence",
    desc: "Paste any post — yours, a competitor's, or one that caught your attention — and get a structured breakdown: intent, hook strength, and exactly what to change.",
    badge: "AI",
  },
  {
    icon: Sparkles,
    color: "bg-violet-400",
    title: "AI Campaign Planning",
    desc: "Describe your goal in plain English. The agent plans the campaign, writes platform-specific content in your brand voice, and schedules everything at the predicted-best times.",
    badge: "AI",
  },
];

const CORE_FEATURES = [
  { icon: Sparkles, title: "AI Caption Generator", desc: "Generate captions, rewrites, hooks and hashtags using Claude AI." },
  { icon: Calendar, title: "Smart Scheduling", desc: "Schedule posts across all platforms with a drag-and-drop calendar." },
  { icon: Rss, title: "RSS Automation", desc: "Automatically post from any RSS feed to your social channels." },
  { icon: Users, title: "Team Workspaces", desc: "Manage multiple brands and clients with role-based access controls." },
  { icon: Zap, title: "Bulk Publishing", desc: "Upload and schedule dozens of posts at once from a CSV or form." },
];

const FUNNEL = [
  { label: "Impressions", value: 3200, widthPct: 100, color: "bg-violet-500" },
  { label: "Link clicks", value: 87, widthPct: 2.7, color: "bg-blue-400" },
  { label: "Pricing page", value: 34, widthPct: 1.06, color: "bg-emerald-400" },
  { label: "Signups", value: 11, widthPct: 0.34, color: "bg-amber-400" },
];

const PLATFORMS = [
  { name: "LinkedIn", color: "#0077B5" },
  { name: "Instagram", color: "#E1306C" },
  { name: "Twitter / X", color: "#1DA1F2" },
  { name: "Facebook", color: "#1877F2" },
  { name: "TikTok", color: "#FF0050" },
];

const PLANS = [
  { name: "Starter", price: "$19", desc: "For solo creators", features: ["6 channels", "120 posts/month", "300 AI credits", "2 team members"] },
  { name: "Growth", price: "$39", desc: "Most popular", features: ["20 channels", "600 posts/month", "2,000 AI credits", "5 team members", "RSS automation"], popular: true },
  { name: "Agency", price: "$79", desc: "For agencies", features: ["Unlimited channels", "Unlimited posts", "Unlimited AI", "15 team members", "White-label ready"] },
];

function AnimatedCount({ target, trigger }: { target: number; trigger: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [trigger, target]);

  return <>{value.toLocaleString()}</>;
}

function AttributionCard() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="bg-gray-900 border border-violet-600/30 rounded-xl overflow-hidden shadow-2xl shadow-black/40">
      <div className="bg-violet-600/10 border-b border-violet-600/30 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />
          Post Attribution Report
        </div>
        <span className="text-xs text-violet-300 bg-violet-600/15 px-2.5 py-1 rounded-full">LinkedIn · Product Launch</span>
      </div>
      <div className="px-5 py-4 border-b border-gray-800 text-sm text-gray-400 leading-relaxed">
        <strong className="text-white">"We've been working on this for 6 months..."</strong>
        <br />
        Published Tue 08:00 · utm_campaign=product_launch
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        {FUNNEL.map((row) => (
          <div key={row.label} className="grid grid-cols-[110px_1fr_50px] items-center gap-3 text-sm">
            <span className="text-gray-400">{row.label}</span>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${row.color} transition-all duration-[1400ms] ease-out`}
                style={{ width: animated ? `${row.widthPct}%` : "0%" }}
              />
            </div>
            <span className="font-bold text-white text-right">
              <AnimatedCount target={row.value} trigger={animated} />
            </span>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center gap-2.5">
        <span className="text-lg">✅</span>
        <p className="text-sm text-gray-200">
          <strong className="text-emerald-400">11 signups</strong> attributed to this post · Conversion rate <strong className="text-emerald-400">12.6%</strong> from clicks
        </p>
      </div>
    </div>
  );
}

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
          <BarChart2 size={14} />
          Social media analytics &amp; website tracking
        </div>
        <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
          Know what's working.<br />
          <span className="text-violet-400">Prove what converts.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          SocialPilot connects your social media performance to real website outcomes — so you can see exactly which post drove which visit, which campaign produced which conversion, and what to do more of next time.
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

      {/* Problem */}
      <section className="py-20 px-8 max-w-6xl mx-auto border-t border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">The Problem</span>
            <h2 className="text-3xl font-bold mt-4 mb-5">You're publishing into a black box.</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              You post on LinkedIn, Instagram, and Twitter — and then what? You check the native app for likes, guess whether the traffic bump came from your campaign, and have no idea which posts actually drove signups or sales.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Most social media tools tell you impressions. None of them close the loop.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {PAIN_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 flex items-start gap-4 transition-colors">
                <div className="w-9 h-9 bg-violet-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-8 bg-gray-900/40 border-y border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex gap-4 relative">
                {i !== FLOW_STEPS.length - 1 && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-px bg-gradient-to-b from-violet-800 to-transparent" />
                )}
                <div className="w-9 h-9 rounded-full border-2 border-violet-600 bg-gray-950 flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-400 z-10">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-sm mt-1.5 mb-1">{step.label}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">The Solution</span>
            <h2 className="text-3xl font-bold mt-4 mb-5">From post to conversion — every step tracked.</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              SocialPilot puts a single tracking snippet on your website and connects it directly to your published social content.
            </p>
            <p className="text-gray-400 leading-relaxed">
              When someone clicks a LinkedIn post and signs up, you see it. When a campaign drives 400 visits but zero conversions, you know immediately.{" "}
              <span className="text-violet-400">Every result feeds back into the platform so your next campaign is built on data — not guesswork.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">What You Get</span>
          <h2 className="text-3xl font-bold mt-4">The analytics layer your social media strategy has been missing.</h2>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
          {ANALYTICS_FEATURES.map(({ icon: Icon, color, title, desc, badge }) => (
            <div key={title} className="grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-4 items-start px-6 py-5 border-b border-gray-800 last:border-b-0 hover:bg-violet-600/[0.04] transition-colors">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                <Icon size={15} className="text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-sm">{title}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              <span
                className={`text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap w-fit ${
                  badge === "AI"
                    ? "bg-indigo-500/15 text-indigo-300"
                    : badge === "New"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-violet-600/15 text-violet-300"
                }`}
              >
                {badge}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-4">Also included</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_FEATURES.map(({ icon: Icon, title, desc }) => (
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

      {/* Attribution */}
      <section className="py-20 px-8 bg-gray-900/40 border-y border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">How Attribution Works</span>
            <h2 className="text-3xl font-bold mt-4 mb-5">One number most tools never show you.</h2>
            <p className="text-gray-400 mb-7 leading-relaxed max-w-md">
              Here's what SocialPilot shows you that no other social media tool does. The card on the right is exactly what you'll see in your dashboard.
            </p>
            <blockquote className="text-xl font-bold text-white leading-snug border-t-2 border-violet-600 border-b border-gray-800 py-6">
              That number — 11 signups from one post — is the number that matters.
            </blockquote>
          </div>
          <AttributionCard />
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">Platforms Supported</span>
        <h2 className="text-3xl font-bold mt-4 mb-4">Every platform your audience is on.</h2>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          SocialPilot connects to all five major platforms — pulling real analytics from each platform's API, not estimates. Post Intelligence works on content from any platform, even ones you haven't connected yet.
        </p>
        <div className="flex flex-wrap gap-3.5 mt-10">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              {p.name}
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

      {/* Closer */}
      <section className="py-20 px-8 text-center border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">Why It Matters</span>
          <h2 className="text-3xl font-bold mt-4 mb-5">Your social media has been generating data for years. It's time to use it.</h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Likes and impressions are vanity metrics. What matters is whether your content is driving real outcomes — traffic, signups, revenue. SocialPilot connects those dots, automatically, across every channel you publish on.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl text-base font-semibold transition-colors">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-600">
        <p>© 2026 SocialPilot. Built with React + FastAPI.</p>
      </footer>
    </div>
  );
}
