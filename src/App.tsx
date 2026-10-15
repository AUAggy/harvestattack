import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { SessionProvider } from "./state/session";
import Home from "./pages/Home";
import Understand from "./pages/Understand";
import Learn from "./pages/Learn";
import Assess from "./pages/Assess";
import Act from "./pages/Act";
import Share from "./pages/Share";
import Sources from "./pages/Sources";
import Updates from "./pages/Updates";
import NotFound from "./pages/NotFound";

const App = () => (
  <SessionProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/understand" element={<Understand />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/assess" element={<Assess />} />
          <Route path="/act" element={<Act />} />
          <Route path="/share" element={<Share />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/updates" element={<Updates />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </SessionProvider>
);

export default App;
