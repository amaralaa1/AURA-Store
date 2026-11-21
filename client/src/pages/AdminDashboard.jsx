
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/orders", {
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

    getOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-yellow-50 text-yellow-700",
      Processing: "bg-blue-50 text-blue-700",
      Shipped: "bg-purple-50 text-purple-700",
      Delivered: "bg-green-50 text-green-700",
      Cancelled: "bg-red-50 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + order.totalPrice, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: "📦",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Delivered Orders",
      value: deliveredOrders,
      icon: "✓",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Sales",
      value: `${totalSales.toLocaleString()} EGP`,
      icon: "💰",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-semibold text-gray-500">
          Loading dashboard...
        </p>
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              AURA Store
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your store and monitor customer orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/products"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
            >
              Manage Products
            </Link>

            <Link
              to="/"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
            >
              Back to Store
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  {stat.title}
                </p>

                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>

              <p className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and manage customer orders.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
              {orders.length} Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="text-6xl">📦</span>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No Orders Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-5">Order ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Total</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-t border-gray-100 text-sm transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-5 font-bold text-gray-800">
                        #{order._id.slice(-8)}
                      </td>

                      <td className="px-6 py-5 font-medium text-gray-700">
                        {order.user?.name || "Customer"}
                      </td>

                      <td className="px-6 py-5 font-bold text-gray-900">
                        {order.totalPrice.toLocaleString()} EGP
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          disabled={order.status === "Cancelled"}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 AURA Store Admin Dashboard
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
