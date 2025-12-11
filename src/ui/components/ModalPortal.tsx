import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
}

const getDialogClass = (size?: "sm" | "lg" | "xl") => {
  switch (size) {
    case "sm":
      return "modal-dialog modal-sm";
    case "lg":
      return "modal-dialog modal-lg";
    case "xl":
      return "modal-dialog modal-xl";
    default:
      return "modal-dialog";
  }
};

export const ModalPortal: React.FC<ModalPortalProps> = ({
  open,
  title,
  children,
  onClose,
  footer,
  size,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal fade show"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className={getDialogClass(size)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
          )}

          <div className="modal-body">{children}</div>

          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
};
