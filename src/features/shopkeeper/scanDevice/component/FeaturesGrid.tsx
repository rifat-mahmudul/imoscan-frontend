import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock } from "lucide-react";

const FEATURES = [
  {
    title: "Global Database",
    desc: "Verified against 140+ global carrier and stolen device registries.",
    icon: ShieldCheck,
    color: "bg-[#E0EEFF]",
  },
  {
    title: "Instant Results",
    desc: "Neural processing ensures reports are generated in under 12 seconds.",
    icon: Zap,
    color: "bg-[#F0E8FF]",
  },
  {
    title: "Private & Secure",
    desc: "End-to-end encrypted scans with zero data retention for unpaid tiers.",
    icon: Lock,
    color: "bg-[#F0FDCF]",
  },
];

export const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-10 mt-8">
      {FEATURES.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`${feature.color} p-8 rounded-[32px] space-y-4 hover:scale-[1.02] transition-transform cursor-default`}
        >
          <div className="w-10 h-10 flex items-center">
            <feature.icon size={20} className="text-[#0F172A]" />
          </div>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">
            {feature.title}
          </h3>
          <p className="text-[#0F172A]/60 text-sm font-semibold leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
