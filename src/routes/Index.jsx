import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/login/Login";
import PrivateRoute from "../components/privateRoute/PrivateRoute";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/layout/dashboard/Dashboard";
import ErrorPage from "../pages/404/ErrorPage";
import User from "../pages/users/User";
import CashIn from "../pages/cashin/CashIn";
import Vault from "../pages/vault/Vault";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  const Routes = [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/users",
          element: <User />,
        },
        {
          path: "/vault",
          element: <Vault />,
        },
        {
          path: "/cashin",
          element: <CashIn />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
      ],
    },
  ];
  const router = createBrowserRouter(Routes);

  return <RouterProvider router={router} />;
};

export default AppRoutes;
