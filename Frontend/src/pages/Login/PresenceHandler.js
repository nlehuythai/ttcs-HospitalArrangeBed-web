import { useEffect } from 'react';
import { API_URL } from '../../api';
import { useLocation } from "react-router-dom";
const PresenceHandler = () => {
    const location = useLocation();
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const sendPing = async () => {
            try {
                await fetch(`${API_URL}/api/users/ping`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Không thể kết nối server để báo danh.");
            }
        };
        console.log("PresenceHandler đã khởi tạo!");
        sendPing();
        const interval = setInterval(sendPing, 30000);

        return () => clearInterval(interval);
    }, [location.pathname]);

    return null;
};

export default PresenceHandler;