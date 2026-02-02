import { motion } from "framer-motion";
import { Github, Linkedin, Globe } from "lucide-react";

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
            <h2 className="text-5xl md:text-7xl font-black mb-3 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              CINEVIEW
            </h2>
            <p className="text-white/60 text-sm tracking-[0.3em] uppercase" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
              Your Premium Cinema Experience
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <a
              href="https://github.com/AllenJohnn"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/60 whitespace-nowrap">GitHub</span>
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/allenjohnjoy/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/60 whitespace-nowrap">LinkedIn</span>
              </div>
            </a>
            <a
              href="https://allenjohnn.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              aria-label="Portfolio"
            >
              <Globe className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/60 whitespace-nowrap">Portfolio</span>
              </div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-white/40 text-sm pt-4"
          >
            <p className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>© {new Date().getFullYear()} CineView.</p>
            <p className="mt-2 text-xs text-white/30">
              Powered by TMDB API
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
