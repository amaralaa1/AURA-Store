
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/users", {
        name,
        email,
        password,
      });

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gray-950 p-12 text-white md:flex">
          <Link to="/" className="text-3xl font-extrabold tracking-widest">
            AURA<span className="text-orange-500">.</span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              Join AURA
            </p>

            <h2 className="text-5xl font-extrabold leading-tight">
              Your Style. Your Story.
            </h2>

            <p className="mt-6 max-w-sm leading-7 text-gray-400">
              Create your account and discover a collection designed for your
              everyday life.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © 2026 AURA Store. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 md:px-14">
          <Link
            to="/"
            className="mb-10 text-center text-3xl font-extrabold tracking-widest text-gray-900 md:hidden"
          >
            AURA<span className="text-orange-500">.</span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Get Started
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
              Create Your Account
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Join AURA Store and discover your own style.
            </p>
          </div>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Password must be at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-orange-500 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-orange-500 transition hover:text-orange-600 hover:underline"
            >
              Login
            </Link>
          </p>

          <Link
            to="/"
            className="mt-6 text-center text-sm font-semibold text-gray-500 transition hover:text-orange-500"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
