import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import Profissional from "./pages/Profissional/index.jsx";
import Cadastro from "./pages/Cadastro/index.jsx";
import Login from "./pages/Login/index.jsx";
import Mapa from "./pages/Mapa/index.jsx";
import Perfil from "./pages/Perfil/index.jsx";
import Admin from "./pages/Admin/index.jsx";
import AppLayout from "./components/Layout/index.jsx";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
        <Route path="/profissional" element={<Profissional />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
