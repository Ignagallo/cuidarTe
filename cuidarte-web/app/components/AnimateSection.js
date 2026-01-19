'use client';

import { motion } from 'framer-motion';

export default function AnimateSection({
  children,
  variant,
  amount = 0.3,   // Qué porcentaje debe entrar en viewport
}) {
  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: false, // se anima cada vez que entra
        amount,
      }}
    >
      {children}
    </motion.div>
  );
}
