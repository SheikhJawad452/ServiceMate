import { motion } from "framer-motion";

const transition = { duration: 0.4, ease: "easeInOut" };

export default function PageWrapper({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
