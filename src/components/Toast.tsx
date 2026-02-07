// Toast 浮动提示组件
// 文字上飘后逐渐消失的效果

import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 进入动画
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // 开始退出动画
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, (toast.duration || 2000) - 300);

    // 移除
    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 2000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
      case 'error':
        return 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
      case 'info':
      default:
        return 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  };

  return (
    <div
      style={{
        background: getBackgroundColor(),
        color: 'white',
        padding: '12px 20px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: isVisible && !isExiting ? 1 : 0,
        transform: isVisible
          ? isExiting
            ? 'translateY(-20px) scale(0.9)'
            : 'translateY(0) scale(1)'
          : 'translateY(-30px) scale(0.8)',
        transition: 'all 0.3s ease',
        pointerEvents: 'auto',
        minWidth: '200px',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
        }}
      >
        {getIcon()}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
