import { CircleCheck } from "lucide-react";
import { useDemo } from "../../lib/store";
export default function Toast() {
  const { toast } = useDemo();
  return (
    <div
      role="status"
      aria-live="polite"
      className={toast ? "toast" : "sr-only"}
    >
      {toast && (
        <>
          <CircleCheck size={19} />
          {toast}
        </>
      )}
    </div>
  );
}
