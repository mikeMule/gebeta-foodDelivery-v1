import { Icons } from "@/lib/icons";
import { motion } from "framer-motion";

interface Step {
  id: number;
  name: string;
  time: string;
  completed: boolean;
}

interface DeliveryStatusProps {
  step: Step;
  isLast: boolean;
}

const DeliveryStatus = ({ step, isLast }: DeliveryStatusProps) => {
  return (
    <motion.div 
      className="relative pl-10 pb-1"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isLast && (
        <div className={`absolute top-0 bottom-0 left-4 w-0.5 ${
          step.completed ? 'bg-[#8B572A]' : 'bg-[#E5A764]/30'
        }`}></div>
      )}
      
      <motion.div 
        className={`absolute top-0 left-0 w-8 h-8 rounded-full ${
          step.completed ? 'bg-[#8B572A]' : 'bg-[#E5A764]/30'
        } flex items-center justify-center shadow-sm`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {step.completed ? (
          <Icons.check className="text-white" />
        ) : (
          <Icons.flag className="text-[#8B572A]" />
        )}
      </motion.div>
      
      <div className="py-2">
        <h3 className={`font-medium ${
          !step.completed ? 'text-[#8B572A]/50' : 'text-[#4F2D1F]'
        }`}>{step.name}</h3>
        <p className="text-xs text-[#8B572A]/70">{step.time}</p>
      </div>
    </motion.div>
  );
};

export default DeliveryStatus;
