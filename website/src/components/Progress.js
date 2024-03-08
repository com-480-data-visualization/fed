import React from "react";
import { motion, useScroll } from "framer-motion";

import "../style/progress-bar.css";

export default function ProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
  );
}
