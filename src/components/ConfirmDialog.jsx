const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="overlay animate-fade-in fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
    >
      <div className="card animate-dialog-drop-in w-full max-w-md p-5 shadow-2xl sm:p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-ink sm:text-xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">{message}</p>

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="btn-danger w-full sm:w-auto"
          >
            {isProcessing ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
