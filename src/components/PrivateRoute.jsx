import { useAuth } from "../hooks/useAuth"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import Spinner from "./Spinner";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Spinner />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet/>;
}

export default PrivateRoute;