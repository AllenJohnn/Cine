import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeAnalytics, trackEvent } from "@/lib/analytics";
import { reportWebVitals } from "@/lib/performance";

initializeAnalytics();

createRoot(document.getElementById("root")!).render(<App />);

reportWebVitals((metric) => {
	trackEvent({
		category: "Performance",
		action: metric.name,
		label: metric.rating,
		value: Math.round(metric.value),
	});
});
