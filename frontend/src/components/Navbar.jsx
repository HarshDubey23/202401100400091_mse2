import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    nav("/");
  };

  return (
    <div className="navbar">
      <h2>Grievance System</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}