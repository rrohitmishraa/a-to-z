import { BrowserRouter, Route, Routes } from "react-router-dom";
import Alphabets from "./Alphabets";

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Alphabets />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
