import React from "react";
import { motion } from "framer-motion";
import "../style/text.css";

const TextContent = ({ text, offset }) => {
  return (
    <motion.div
      className="text"
      initial={{ x: offset }}
      whileInView={{ x: 0 }}
      transition={{ delay: 0.1, ease: "easeIn" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {text}
    </motion.div>
  );
};

export default TextContent;
