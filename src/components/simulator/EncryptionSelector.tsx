import { EncryptionType, encryptionTypes } from '@/lib/simulation-data';
import { Lock, Shield, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EncryptionSelectorProps {
  selected: EncryptionType;
  onChange: (type: EncryptionType) => void;
}

const icons: Record<EncryptionType, React.ReactNode> = {
  RSA_2048: <Lock className="w-4 h-4" />,
  X25519: <Shield className="w-4 h-4" />,
  MLKEM768_HYBRID: <ShieldCheck className="w-4 h-4" />,
};

const colorMap: Record<EncryptionType, string> = {
  RSA_2048: 'border-enc-rsa bg-enc-rsa/10 text-enc-rsa',
  X25519: 'border-enc-x25519 bg-enc-x25519/10 text-enc-x25519',
  MLKEM768_HYBRID: 'border-enc-mlkem bg-enc-mlkem/10 text-enc-mlkem',
};

const inactiveClass = 'border-border bg-surface-2/50 text-muted-foreground hover:bg-surface-3/50';

export default function EncryptionSelector({ selected, onChange }: EncryptionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {(Object.keys(encryptionTypes) as EncryptionType[]).map((type) => {
        const enc = encryptionTypes[type];
        const isActive = selected === type;
        return (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onChange(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${
                  isActive ? colorMap[type] : inactiveClass
                }`}
              >
                {icons[type]}
                <span className="hidden sm:inline">{enc.name}</span>
                <span className="sm:hidden">{enc.shortName}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs bg-surface-2 border-border text-foreground">
              <p className="text-sm">{enc.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
