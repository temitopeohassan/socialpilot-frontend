import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../lib/api";
import { Zap, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.access_token, res.data.user);
      navigate("/app/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to SocialPilot</p>
        </div>

        <div className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white"
          />
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white pr-10"
            />
            <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-400 hover:text-violet-300">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await authApi.register(name, email, password);
      setAuth(res.data.access_token, res.data.user);
      navigate("/app/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start publishing smarter</p>
        </div>

        <div className="space-y-4">
          {[
            { value: name, set: setName, placeholder: "Full name", type: "text" },
            { value: email, set: setEmail, placeholder: "Email address", type: "email" },
            { value: password, set: setPassword, placeholder: "Password (8+ chars)", type: "password" },
          ].map(({ value, set, placeholder, type }) => (
            <input
              key={placeholder} type={type} value={value} onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white"
            />
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
