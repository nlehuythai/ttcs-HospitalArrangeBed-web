import { useEffect } from 'react';
import { API_URL } from '../api';

const PresenceHandler = () => {
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

        sendPing();

        // Cứ mỗi 30 giây gửi một lần để server biết y tá vẫn đang mở web
        const interval = setInterval(sendPing, 30000);

        return () => clearInterval(interval);
    }, []);

    return null;
};

export default PresenceHandler;