import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="auth-container">
      <motion.form className="card" onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Login</h2>
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button>Login</button>
        <p><Link to="/register">Create Account</Link></p>
      </motion.form>
    </div>
  );
}
