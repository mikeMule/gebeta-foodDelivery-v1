import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animation";

const SplashScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#4F2D1F] to-[#8B572A] flex justify-center items-center z-50 overflow-hidden">
      {/* Background Animation Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        className="text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mx-auto bg-white rounded-full p-5 w-[140px] h-[140px] flex items-center justify-center shadow-lg"
          variants={itemVariants}
          animate={{ 
            scale: [1, 1.05, 1],
            rotateZ: [0, 5, 0, -5, 0], 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4
          }}
        >
          <motion.svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ethiopian injera with food toppings */}
            <circle cx="50" cy="50" r="40" fill="#E5A764" />
            <path d="M30,35 C40,45 60,45 70,35" stroke="#8B572A" strokeWidth="2" />
            <circle cx="40" cy="45" r="8" fill="#C73030" /> {/* Doro Wat */}
            <circle cx="60" cy="45" r="6" fill="#4CAF50" /> {/* Gomen */}
            <circle cx="50" cy="60" r="7" fill="#8D6E63" /> {/* Misir */}
            <path d="M25,50 C35,75 65,75 75,50" stroke="#8B572A" strokeWidth="2" />
          </motion.svg>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-white mt-6 font-dm-sans tracking-wide">Gebeta</h1>
          <p className="text-white mt-2 opacity-90 text-lg">Ethiopian cuisine at your doorstep</p>
        </motion.div>
        
        <motion.div 
          className="mt-8 flex justify-center space-x-2"
          variants={itemVariants}
        >
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
          />
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          />
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
