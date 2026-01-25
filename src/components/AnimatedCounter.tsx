import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

export default function AnimatedCounter({ 
  from = 0, 
  to, 
  duration = 2, 
  decimals = 0,
  suffix = "",
  prefix = ""
}: CounterProps) {
  const validDecimals = Math.max(0, Math.min(decimals, 20));
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(validDecimals) + suffix;
  });

  useEffect(() => {
    const controls = animate(count, to, { duration });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
}
