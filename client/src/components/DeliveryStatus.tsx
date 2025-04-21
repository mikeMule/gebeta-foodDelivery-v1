import { Icons } from "@/lib/icons";

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
    <div className="relative pl-8 pb-1">
      {!isLast && (
        <div className={`absolute top-0 bottom-0 left-3 w-0.5 ${step.completed ? 'bg-primary' : 'bg-neutral-300'}`}></div>
      )}
      <div className={`absolute top-0 left-0 w-6 h-6 rounded-full ${step.completed ? 'bg-primary' : 'bg-neutral-200'} flex items-center justify-center`}>
        {step.completed ? (
          <Icons.check className="text-white text-sm" />
        ) : (
          <Icons.flag className="text-neutral-400 text-sm" />
        )}
      </div>
      <div className="py-2">
        <h3 className={`font-medium ${!step.completed ? 'text-neutral-400' : ''}`}>{step.name}</h3>
        <p className="text-xs text-neutral-500">{step.time}</p>
      </div>
    </div>
  );
};

export default DeliveryStatus;
