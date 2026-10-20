import { cn } from "@/lib/utils";
import { useState } from "react";

export const OriginUiNavigationBar = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-card border shadow-sm")}>
      <h1 className="text-2xl font-bold mb-2">Component Example</h1>
      <h2 className="text-xl font-semibold">{count}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setCount((prev) => prev - 1)}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default OriginUiNavigationBar;
