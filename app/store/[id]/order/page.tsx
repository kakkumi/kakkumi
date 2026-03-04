import { Suspense } from "react";
import OrderClient from "./OrderClient";

export default function OrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
            </div>
        }>
            <OrderClient />
        </Suspense>
    );
}
