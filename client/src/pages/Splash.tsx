import { motion } from "framer-motion";

const SplashScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-primary flex justify-center items-center z-50">
      <div className="text-center">
        <motion.div 
          className="mx-auto bg-white rounded-full p-4 w-[120px] h-[120px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M30,40 L70,40 L60,70 L40,70 Z" fill="#FF3008"></path>
            <circle cx="50" cy="30" r="10" fill="#FF3008"></circle>
          </svg>
        </motion.div>
        <h1 className="text-3xl font-bold text-white mt-6 font-dm-sans tracking-wider">FoodDash</h1>
        <p className="text-white mt-2 opacity-90">Delicious food at your doorstep</p>
        <div className="mt-8 flex justify-center space-x-2">
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0 }}
          />
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          />
          <motion.div 
            className="w-3 h-3 bg-white rounded-full" 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
