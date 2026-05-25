"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "24", label: "Platforms Covered" },
  { value: "256-bit", label: "Encryption" },
  { value: "Real-Time", label: "Threat Detection" },
  { value: "POPIA + GDPR", label: "Compliant" },
];

export default function StatsBar() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-3xl sm:text-4xl font-bold text-[#071426] mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-[#071426]/60 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
