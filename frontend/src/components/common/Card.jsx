import clsx from "clsx";

const Card = ({ children, className, onClick, selected }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl border transition-all duration-200 p-6 cursor-pointer",
        // If selected, show a Green Ring. If not, show a subtle Gray Border.
        selected
          ? "border-action ring-2 ring-action ring-opacity-50 shadow-md scale-[1.02]"
          : "border-slate-200 hover:border-brand/30 hover:shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
