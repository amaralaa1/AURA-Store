import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const cancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.put(
        `/orders/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(response.data.order);
      alert("Order cancelled successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    const getOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get(`/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    getOrder();
  }, [id]);

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
        <p className="font-semibold text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-center font-semibold text-red-500">{error}</p>

        <Link
          to="/my-orders"
          className="mt-5 font-semibold text-orange-500 hover:text-orange-600"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900">
          Order Not Found
        </h2>

        <Link
          to="/my-orders"
          className="mt-5 font-semibold text-orange-500 hover:text-orange-600"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
              Your Account
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review your order and track its status.
            </p>
          </div>

          <Link
            to="/my-orders"
            className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
          >
            ← My Orders
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-6 py-6 sm:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Order ID
              </p>

              <p className="mt-2 break-all text-sm font-bold text-gray-900">
                #{order._id}
              </p>
            </div>

            <span
              className={`rounded-full border px-5 py-2 text-sm font-bold ${getStatusStyle(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Ordered Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {order.products.length}{" "}
                {order.products.length === 1 ? "Product" : "Products"} in this
                order
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {order.products.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {item.product?.name || "Product"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Price: {item.price.toLocaleString()} EGP each
                    </p>
                  </div>

                  <p className="text-base font-extrabold text-gray-900">
                    {(item.price * item.quantity).toLocaleString()} EGP
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Shipping Address
              </p>

              <p className="mt-3 text-sm leading-7 text-gray-700">
                {order.shippingAddress}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Amount
                </p>

                <p className="mt-1 text-2xl font-extrabold text-orange-600">
                  {order.totalPrice.toLocaleString()} EGP
                </p>
              </div>

              {["Pending", "Processing"].includes(order.status) && (
                <button
                  onClick={cancelOrder}
                  disabled={cancelLoading}
                  className="rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
