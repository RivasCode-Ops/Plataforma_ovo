import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Manutencao from "../pages/manutencao/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    // element: <Manutencao />, // ← TELA TEMPORÁRIA (comentar para reativar o site)
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
