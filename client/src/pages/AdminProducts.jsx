
import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      stock: "",
    });

    setEditingProductId(null);
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      if (editingProductId === productId) {
        resetForm();
      }

      alert("Product deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingProductId) {
        const response = await api.put(
          `/products/${editingProductId}`,
          productData,
          config
        );

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === editingProductId
              ? response.data.product
              : product
          )
        );

        alert("Product updated successfully!");
      } else {
        const response = await api.post("/products", productData, config);

        setProducts((prevProducts) => [
          ...prevProducts,
          response.data.product,
        ]);

        alert("Product added successfully!");
      }

      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save product");
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const outOfStock = products.filter(
    (product) => product.stock === 0
  ).length;

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: "📦",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: "📊",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Out of Stock",
      value: outOfStock,
      icon: "⚠️",
      color: "bg-red-50 text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-semibold text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-center font-semibold text-red-500">{error}</p>

        <Link
          to="/admin"
          className="mt-5 font-semibold text-orange-500 hover:text-orange-600"
        >
          Back to Dashboard
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
              Manage Products
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Add, edit and manage your store products.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
            >
              ← Dashboard
            </Link>

            <Link
              to="/"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
            >
              View Store
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-3">
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
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>

              <p className="mt-5 text-3xl font-extrabold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddProduct}
          className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
                Product Management
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the product information below.
              </p>
            </div>

            {editingProductId && (
              <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600">
                Editing Product
              </span>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Name
              </label>

              <input
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <input
                type="text"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Price (EGP)
              </label>

              <input
                type="number"
                placeholder="Enter price"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock Quantity
              </label>

              <input
                type="number"
                placeholder="Enter stock quantity"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Image URL
              </label>

              <input
                type="text"
                placeholder="Example: /iphone18promax.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Description
              </label>

              <textarea
                placeholder="Write a short product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows="4"
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          {formData.image && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Image Preview
              </p>

              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
            >
              {editingProductId ? "Save Changes" : "Add Product"}
            </button>

            {editingProductId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                All Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your current store inventory.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
              {products.length} Products
            </span>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="text-6xl">📦</span>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No Products Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add your first product using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-5">Product</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Price</th>
                    <th className="px-6 py-5">Stock</th>
                    <th className="px-6 py-5">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-100 text-sm transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <span className="font-bold text-gray-800">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        {product.price.toLocaleString()} EGP
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            product.stock > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} In Stock`
                            : "Out of Stock"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditProduct(product)}
                            className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product._id)}
                            className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © 2026 AURA Store Product Management
        </p>
      </div>
    </div>
  );
}

export default AdminProducts;
