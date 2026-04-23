import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import Hero3D from "../components/Hero3D";
import GrievanceCard from "../components/GrievanceCard";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "Other" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await API.get("/grievances");
    setData(res.data);
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const res = await API.get("/grievances");

        if (!ignore) {
          setData(res.data);
        }
      } catch (err) {
        if (!ignore) {
          alert(err.response?.data?.message || "Failed to load grievances");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/grievances", form);
      setForm({ title: "", description: "", category: "Other" });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit grievance");
    }
  };

  const del = async (id) => {
    try {
      await API.delete(`/grievances/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete grievance");
    }
  };

  return (
    <div className="dashboard">

      <Navbar />
      <Hero3D />

      <form className="card" onSubmit={submit}>
        <input
          placeholder="Title"
          value={form.title}
          required
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Description"
          value={form.description}
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option>Academic</option>
          <option>Hostel</option>
          <option>Transport</option>
          <option>Other</option>
        </select>
        <button>Submit Grievance</button>
      </form>

      <div className="grid">
        {!loading && data.length === 0 && <p>No grievances submitted yet.</p>}
        {data.map((g) => (
          <GrievanceCard key={g._id} g={g} onDelete={del}/>
        ))}
      </div>

    </div>
  );
}
