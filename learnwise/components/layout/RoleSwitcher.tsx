import { ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "../../lib/store";
export default function RoleSwitcher({ onSwitch }: { onSwitch?: () => void }) {
  const { state, update } = useDemo();
  const navigate = useNavigate();
  return (
    <button
      className="role-switch"
      aria-label={`Switch to ${state.role === "student" ? "Professor" : "Student"}`}
      onClick={() => {
        const role = state.role === "student" ? "faculty" : "student";
        update(
          (s) => ({ ...s, role }),
          `Switched to ${role === "faculty" ? "Professor" : "Student"} view`,
        );
        navigate(`/${role}/dashboard`);
        onSwitch?.();
      }}
    >
      <ArrowLeftRight size={16} />
      <span>
        Switch to {state.role === "student" ? "Professor" : "Student"}
      </span>
      <span className="demo-mini">DEMO</span>
    </button>
  );
}
