import { motion } from "framer-motion";

export const ScanHeader = () => {
  return (
    <div className="space-y-4 mb-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-black text-foreground tracking-tight"
      >
        Scan Device
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-lg font-medium leading-relaxed"
      >
        Enter your device details for a comprehensive security and diagnostic
        analysis.
      </motion.p>
    </div>
  );
};
