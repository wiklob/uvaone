import { motion } from 'framer-motion';
import './Placeholder.css';

interface PlaceholderProps {
  icon: string;
  title: string;
  description: string;
}

export default function Placeholder({ icon, title, description }: PlaceholderProps) {
  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="placeholder-container"
      >
        <div className="placeholder-icon">{icon}</div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-description">{description}</p>
        <div className="placeholder-badge">Coming Soon</div>
      </motion.div>
    </div>
  );
}