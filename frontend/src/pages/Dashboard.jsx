import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import Hero3D from "../components/Hero3D";
import GrievanceCard from "../components/GrievanceCard";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "Other" });

  const fetchData = async () => {
    const res=await API.get("/grievances");
    setData(res.data);
  };

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      const res = await API.get("/grievances");

      if (!ignore) {
        setData(res.data);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await API.post("/grievances", form);
    await fetchData();
  };

  const del = async (id) => {
    await API.delete(`/grievances/${id}`);
    await fetchData();
  };

  return (
    <div className="dashboard">

      <Navbar />
      <Hero3D />

      <form className="card" onSubmit={submit}>
        <input placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })}/>
        <input placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })}/>
        <select onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Academic</option>
          <option>Hostel</option>
          <option>Transport</option>
          <option>Other</option>
        </select>
        <button>Submit</button>
      </form>

      <div className="grid">
        {data.map((g) => (
          <GrievanceCard key={g._id} g={g} onDelete={del}/>
        ))}
      </div>

    </div>
  );
}
