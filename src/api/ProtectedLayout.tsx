import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ProtectedRoute } from "../api/ProtectedRoute";

const ProtectedLayout = () => {
    return (
        <ProtectedRoute>
            <div style={{ display: "flex", position: "sticky", top: 0 }}>
                <Sidebar />

                <div style={{ width: "100%" }}>
                    <Header />

                    <div style={{ height: "calc(100% - 64.5px)", overflowY: "auto" }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProtectedLayout;