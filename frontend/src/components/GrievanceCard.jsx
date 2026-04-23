import { motion } from "framer-motion";

export default function GrievanceCard({ g, onDelete }) {
  return (
    <motion.div
      className="card"
      whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
    >
      <h3>{g.title}</h3>
      <p>{g.description}</p>
      <small>{g.category}</small>
      <small>Status: {g.status}</small>
      <button onClick={() => onDelete(g._id)}>Delete</button>
    </motion.div>
  );
}
