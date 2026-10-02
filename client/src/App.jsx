import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Overview from "./pages/Overview.jsx";
import DiseaseScanner from "./pages/DiseaseScanner.jsx";
import Weather from "./pages/Weather.jsx";
import YieldFertilizer from "./pages/YieldFertilizer.jsx";
import Storage from "./pages/Storage.jsx";
import Market from "./pages/Market";
import Soil from "./pages/Soil";
import CropRisk from "./pages/CropRisk";
import KhetiAI from "./pages/KhetiAI";
export default function App() {
  return (
    <>
      <div className="field-lines" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/disease" element={<DiseaseScanner />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/yield" element={<YieldFertilizer />} />
          <Route path="/storage" element={<Storage />} />
          <Route
  path="/market"
  element={<Market />}
/>

<Route
  path="/soil"
  element={<Soil />}
/>

<Route
  path="/crop-risk"
  element={<CropRisk />}
/>

<Route
  path="/kheti-ai"
  element={<KhetiAI />}
/>
        </Routes>
      </main>
      <footer>
        <div className="footer-inner">
          <span>Kheti Panel — MERN build</span>
          <span>Vision &amp; text calls run on Claude via the Express API · yield model and sensors are simulated for this demo</span>
        </div>
      </footer>
    </>
  );
}
