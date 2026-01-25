import { motion } from "framer-motion";

export default function Footer() {

  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight">
              CINE
            </h2>
            <p className="text-white/60 text-sm tracking-widest uppercase">
              Your Premium Cinema Experience
            </p>
          </motion.div>



          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-white/40 text-sm"
          >
            <p>© {new Date().getFullYear()} CINE. Crafted with passion.</p>
            <p className="mt-1 text-xs">
              Powered by TMDB
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
