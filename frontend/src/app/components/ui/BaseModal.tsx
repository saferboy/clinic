import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BaseModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  scrollable?: boolean;
  footer?: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  saveLoading?: boolean;
  zIndex?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function BaseModal({
  title,
  onClose,
  children,
  size = 'md',
  scrollable = false,
  footer,
  onSave,
  saveLabel = 'Saqlash',
  saveLoading = false,
  zIndex = 'z-50',
}: BaseModalProps) {
  return (
    <div className={`fixed inset-0 bg-black/60 ${zIndex} flex items-center justify-center p-4`}>
      <div
        className={`bg-background rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${scrollable ? 'max-h-[90vh] flex flex-col' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={`p-6 space-y-4 ${scrollable ? 'overflow-y-auto flex-1' : ''}`}>
          {children}
        </div>

        {/* Footer */}
        {(footer || onSave) && (
          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
            {footer ?? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saveLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saveLoading ? 'Saqlanmoqda...' : saveLabel}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Overlay click */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
