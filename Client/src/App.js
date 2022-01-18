import Layout from "./Components/Layout/Layout";
import VideoCall from "./Components/VideoCall/VideoCall";
import Main from "./Components/Main/Main";
import { Route, Routes } from "react-router-dom";
function App() {
  return (
    <div>
      <Layout>
        <Routes>
          <Route path="/video/:roomId/:name" element={<VideoCall />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
