

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    getMyOrders();
  }, []);

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Processing: "bg-blue-50 text-blue-700 border-blue-200",
      Shipped: "bg-purple-50 text-purple-700 border-purple-200",
      Delivered: "bg-green-50 text-green-700 border-green-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-semibold text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-center font-semibold text-red-500">{error}</p>
        <Link
          to="/"
          className="mt-5 font-semibold text-orange-500 hover:text-orange-600"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Your Account
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Track and manage all your purchases.
            </p>
          </div>

          <Link
            to="/"
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
          >
            ← Back to Store
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <span className="text-7xl">🛍️</span>

            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              You haven't placed any orders yet. Explore our collection and
              find something you love.
            </p>

            <Link
              to="/"
              className="mt-7 inline-block rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Your Orders
              </p>

              <span className="rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold text-orange-600">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Order ID
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-gray-900">
                      #{order._id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-bold ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-4 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      Order Items
                    </h3>

                    <span className="text-xs text-gray-400">
                      {order.products.length}{" "}
                      {order.products.length === 1 ? "Product" : "Products"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {order.products.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.product?.name || "Product"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} EGP
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Shipping Address
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {order.shippingAddress}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-orange-600">
                        {order.totalPrice.toLocaleString()} EGP
                      </p>
                    </div>

                    <Link
                      to={`/order/${order._id}`}
                      className="rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                    >
                      View Order Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
