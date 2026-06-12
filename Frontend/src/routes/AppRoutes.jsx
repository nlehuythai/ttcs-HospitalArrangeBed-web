import LayoutNurse from "../pages/Nurse/LayoutNurse";
import Overview from "../Components/Nurse/Overview";
import TaskList from "../Components/Nurse/TaskList";
import ArrangeBed from "../Components/Nurse/ArrangeBed";
import DischargeProcessNurse from "../Components/Nurse/DischargeProcess";
import DischargeProcessDoctor from "../Components/Doctor/DischargeProcess";

import LayoutDoctor from "../pages/Doctor/LayoutDoctor";
import ManagePatient from "../Components/Doctor/ManagePatient";
import LayoutAdmin from "../pages/Admin/LayoutAdmin";
import AccountsManage from "../Components/Admin/AccountManage";
import Reports from "../Components/Admin/SystemReport";
import LoginLayout from "../pages/Login/LoginLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminBedMap from "../Components/Admin/AdminBedMap";
import UserSettings from "../pages/shared/UserSettings";
import OrderEntry from "../Components/Doctor/OrderEntry";
import PresenceHandler from "../pages/Login/PresenceHandler";
import AdminTaskBoard from "../Components/Admin/AdminTaskBoard";
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <PresenceHandler />
            <Routes>
                <Route path="/login" element={<LoginLayout />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                    path="/nurse"
                    element={
                        <ProtectedRoute allowedRole="Y tá">
                            <LayoutNurse />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="TaskList" element={<TaskList />} />
                    <Route path="beds" element={<ArrangeBed />} />
                    <Route path="DischargeProcessNurse" element={<DischargeProcessNurse />} />
                    <Route path="settings" element={<UserSettings />} />
                </Route>
                <Route
                    path="/doctor"
                    element={
                        <ProtectedRoute allowedRole="Bác sĩ">
                            <LayoutDoctor />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="ManagePatient" replace />} />
                    <Route path="DischargeProcessDoctor/:id?" element={<DischargeProcessDoctor />} />
                    <Route path="ManagePatient" element={<ManagePatient />} />
                    <Route path="settings" element={<UserSettings />} />
                    <Route path="OrderEntry" element={<OrderEntry />} />
                </Route>
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <LayoutAdmin />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="accounts" replace />} />
                    <Route path="accounts" element={<AccountsManage />} />
                    <Route path="reports">
                        <Route index element={<Reports />} />
                        <Route path="/admin/reports/AdminBedMap" element={<AdminBedMap />} />
                    </Route>
                    <Route path="task-board" element={<AdminTaskBoard />} />
                    <Route path="settings" element={<UserSettings />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;