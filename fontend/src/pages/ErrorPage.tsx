import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-xl mb-8">Trang này không tồn tại hoặc đã bị gỡ bỏ.</p>
            <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90">
                Về trang chủ
            </Link>
        </div>
    );
};

export default ErrorPage;
