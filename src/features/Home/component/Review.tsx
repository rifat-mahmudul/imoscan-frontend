"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const reviews = [
  {
    name: "Usman Zafar",
    role: "Customer",
    avatar: "https://i.pravatar.cc/150?u=1",
    text: "Working with this team was a game-changer for our brand. From strategy to design, they delivered beyond expectations — always on time and with exceptional quality.",
  },
  {
    name: "Sarah Ahmed",
    role: "Marketing Director, Nestly",
    avatar: "https://i.pravatar.cc/150?u=2",
    text: "Partnering with this agency was one of the best decisions we've made for our brand. Their team didn't just follow a brief — they elevated our vision. From creative direction to precise execution, every detail was handled with care. The final output exceeded expectations and our customer engagement has noticeably increased.",
  },
  {
    name: "Daniel Chowdhury",
    role: "Creative Lead, Loop Agency",
    avatar: "https://i.pravatar.cc/150?u=3",
    text: "You rarely find an agency that balances bold creative ideas with solid execution — but this team nails it. They understood our brand's voice, brought fresh ideas to the table, and delivered polished visuals that made an impact. Highly recommended to anyone seeking high-level creative support.",
  },
  {
    name: "Tariq Mehedi",
    role: "CTO, BlueEdge Solutions",
    avatar: "https://i.pravatar.cc/150?u=4",
    text: "They didn't just design a website — they crafted a user journey. Their approach to UX/UI was both strategic and empathetic, which was crucial for our tech product. Their team felt like an extension of ours, always available and quick to adapt based on feedback.",
  },
  {
    name: "Lina Gomez",
    role: "Co-Founder, Digidrop",
    avatar: "https://i.pravatar.cc/150?u=5",
    text: "Their data-driven thinking combined with a strong creative pulse helped us launch a campaign that beat our projections by 40%. Every team member was proactive, solutions-oriented, and committed to our success. We'll definitely work with them again on future initiatives.",
  },
  {
    name: "Emily Rivera",
    role: "Operations Lead, UrbanHive",
    avatar: "https://i.pravatar.cc/150?u=6",
    text: "What impressed me most was their ability to simplify complex challenges. We needed a brand refresh, a better user experience, and improved conversion — and they delivered on all fronts. Communication was clear, timelines were met, and the final product reflected our identity perfectly.",
  },
];

export default function Review() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="mx-auto container px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6"
          >
            What our <span className="text-[#84CC16]">Customers</span> are{" "}
            <span className="text-[#3B82F6]">Saying</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#64748B] text-lg max-w-2xl mx-auto"
          >
            Don&apos;t just take our word for it. Here&apos;s what thousands of
            happy users have to say about their experience with our platform.
          </motion.p>
        </div>

        {/* Review Grid (Column-based for masonry feel) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="break-inside-avoid bg-white p-8 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full ring-2 ring-gray-50 overflow-hidden shrink-0">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#3B82F6] group-hover:text-[#0F172A] transition-colors">
                    {review.name}
                  </h4>
                  <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    {review.role}
                  </p>
                </div>
              </div>
              <p className="text-[#1E293B] text-sm leading-relaxed font-medium">
                {review.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
