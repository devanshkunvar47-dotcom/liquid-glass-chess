import {
  RotateCcw,
  Undo2,
  Handshake,
  Flag,
  RefreshCw,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';

function Ctrl({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'glass glass-hover flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5',
        disabled ? 'opacity-40' : '',
        danger ? 'text-red-300' : 'text-2',
      ].join(' ')}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function GameControls({
  onNewGame,
  onUndo,
  onDraw,
  onResign,
  onFlip,
  onToggleSound,
  onSettings,
  onExit,
  soundOn,
  canUndo,
}: {
  onNewGame: () => void;
  onUndo: () => void;
  onDraw: () => void;
  onResign: () => void;
  onFlip: () => void;
  onToggleSound: () => void;
  onSettings: () => void;
  onExit: () => void;
  soundOn: boolean;
  canUndo: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Ctrl icon={<RotateCcw size={18} />} label="New" onClick={onNewGame} />
        <Ctrl icon={<Undo2 size={18} />} label="Undo" onClick={onUndo} disabled={!canUndo} />
        <Ctrl icon={<Handshake size={18} />} label="Draw" onClick={onDraw} />
        <Ctrl icon={<Flag size={18} />} label="Resign" onClick={onResign} danger />
      </div>
      <div className="flex gap-2">
        <Ctrl icon={<RefreshCw size={18} />} label="Flip" onClick={onFlip} />
        <Ctrl
          icon={soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          label="Sound"
          onClick={onToggleSound}
        />
        <Ctrl icon={<SettingsIcon size={18} />} label="Settings" onClick={onSettings} />
        <Ctrl icon={<LogOut size={18} />} label="Exit" onClick={onExit} danger />
      </div>
    </div>
  );
}
