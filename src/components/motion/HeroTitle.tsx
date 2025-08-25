// src/components/motion/HeroTitle.tsx  ← Client component
"use client";

import { motion } from "framer-motion";
import React from "react";

type Props = { children: React.ReactNode };

export function HeroTitle({ children }: Props) {
  return (
    <motion.h1
      className="text-3xl font-bold text-center dark:text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.h1>
  );
}