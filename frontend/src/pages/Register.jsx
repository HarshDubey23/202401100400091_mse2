import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", course: "", email: "", password: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/register", form);
      nav("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={submit}>
        <h2>Register</h2>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })}/>
        <input placeholder="Course" onChange={(e) => setForm({ ...form, course: e.target.value })}/>
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })}/>
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })}/>
        <button>Register</button>
      </form>
    </div>
  );
}
