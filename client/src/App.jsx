import { useEffect, useState } from "react";
import api from "./api";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        if (existingProduct.quantity >= product.stock) {
          return prevCart;
        }

        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const placeOrder = async () => {
    if (!localStorage.getItem("token")) {
  alert("Please login first to place an order.");
  return;
}
    if (!shippingAddress.trim()) {
      alert("Please enter your shipping address");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const orderData = {
        products: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress.trim(),
      };

      await api.post("/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Order placed successfully!");

      setCart([]);
      setShippingAddress("");
      setIsCartOpen(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to place order. Please login first."
      );
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
  const handleAuthChange = () => {
    const savedUser = localStorage.getItem("user");

    setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
  };

  window.addEventListener("authChanged", handleAuthChange);

  return () => {
    window.removeEventListener("authChanged", handleAuthChange);
  };
}, []);

 return (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/order/:id" element={<OrderDetails />} />
      <Route path="/admin" element={ currentUser?.role === "admin" ? ( <AdminDashboard /> ) : (<Navigate to="/" replace />) }/>
      <Route path="/admin/products" element={ currentUser?.role === "admin" ? ( <AdminProducts />) : (<Navigate to="/" replace /> )}/>

      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-white">

     
<header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
    <Link to="/" className="shrink-0">
      <h1 className="text-2xl font-extrabold tracking-widest text-gray-900">
        AURA<span className="text-orange-500">.</span>
      </h1>
    </Link>

    <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
      <a href="#" className="transition hover:text-orange-500">
        Home
      </a>
      <a href="#products" className="transition hover:text-orange-500">
        Shop
      </a>
      <a href="#about" className="transition hover:text-orange-500">
        About
      </a>
    </nav>

    <div className="flex items-center gap-3 md:gap-5">
      {currentUser ? (
        <>
          <span className="hidden text-sm font-semibold text-gray-700 lg:block">
            Hello, {currentUser.name}
          </span>

          {currentUser.role === "admin" && (
            <Link
              to="/admin"
              className="hidden text-sm font-semibold text-orange-500 transition hover:text-orange-600 sm:block"
            >
              Admin Dashboard
            </Link>
          )}

          <Link
            to="/my-orders"
            className="hidden text-sm font-semibold text-gray-700 transition hover:text-orange-500 sm:block"
          >
            My Orders
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setCurrentUser(null);
            }}
            className="text-sm font-semibold text-gray-700 transition hover:text-orange-500"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-700 transition hover:text-orange-500"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
          >
            Register
          </Link>
        </>
      )}

      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="whitespace-nowrap rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-orange-500 hover:text-orange-500"
      >
        Bag ({cart.reduce((total, item) => total + item.quantity, 0)})
      </button>
    </div>
  </div>
</header>


      
{isCartOpen && (
  <div
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
    onClick={() => setIsCartOpen(false)}
  >
    <div
      className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Shopping Cart
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {cart.reduce((total, item) => total + item.quantity, 0)} items in your bag
          </p>
        </div>

        <button
          onClick={() => setIsCartOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-500 transition hover:bg-orange-100 hover:text-orange-500"
        >
          ×
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="text-7xl">🛍️</span>
          <h3 className="mt-6 text-xl font-bold text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Looks like you haven't added anything yet.
          </p>
          <button
            onClick={() => setIsCartOpen(false)}
            className="mt-6 rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-4 border-b border-gray-100 pb-5"
              >
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {item.price.toLocaleString()} EGP
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setCart((prevCart) =>
                            prevCart
                              .map((product) =>
                                product._id === item._id
                                  ? {
                                      ...product,
                                      quantity: product.quantity - 1,
                                    }
                                  : product
                              )
                              .filter((product) => product.quantity > 0)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold transition hover:bg-orange-100"
                      >
                        -
                      </button>

                      <span className="text-sm font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          setCart((prevCart) =>
                            prevCart.map((product) =>
                              product._id === item._id &&
                              product.quantity < product.stock
                                ? {
                                    ...product,
                                    quantity: product.quantity + 1,
                                  }
                                : product
                            )
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        setCart((prevCart) =>
                          prevCart.filter(
                            (product) => product._id !== item._id
                          )
                        )
                      }
                      className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 bg-white px-6 py-6">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Shipping Address
            </label>

            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              rows="3"
            />

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="font-semibold text-gray-600">
                Total
              </span>

              <span className="text-2xl font-extrabold text-gray-900">
                {cart
                  .reduce(
                    (total, item) =>
                      total + item.price * item.quantity,
                    0
                  )
                  .toLocaleString()} EGP
              </span>
            </div>

            <button
              onClick={placeOrder}
              className="mt-5 w-full rounded-full bg-orange-500 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 hover:shadow-xl"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

<main>
  <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
    <div>
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
        New Collection 2026
      </p>

      <h2 className="max-w-xl text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-7xl">
        Find Your Own <span className="text-orange-500">Style.</span>
      </h2>

      <p className="mt-7 max-w-lg text-base leading-8 text-gray-500 md:text-lg">
        Discover products designed for your everyday life.
        Quality, simplicity and style in one place.
      </p>

      <a
        href="#products"
        className="mt-9 inline-block rounded-full bg-gray-900 px-10 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-orange-500 hover:shadow-xl"
      >
        Explore Collection
      </a>
    </div>

    <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 p-8 shadow-inner">
      <div className="text-center">
        <span className="inline-block text-9xl drop-shadow-lg transition duration-500 hover:scale-110">
          🛍️
        </span>

        <p className="mt-7 text-xs font-bold tracking-[0.3em] text-orange-700">
          YOUR STYLE STARTS HERE
        </p>
      </div>
    </div>
  </section>

  <section
    id="products"
    className="mx-auto max-w-7xl px-6 py-16"
  >
    <div className="mb-10">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-500">
        Our Collection
      </p>

      <h2 className="text-3xl font-bold text-gray-900">
        Featured Products
      </h2>
    </div>

    {loading && (
      <p className="py-10 text-center text-gray-500">
        Loading products...
      </p>
    )}

    {error && (
      <p className="py-10 text-center text-red-500">
        {error}
      </p>
    )}

    {!loading && !error && products.length === 0 && (
      <p className="py-10 text-center text-gray-500">
        No products available.
      </p>
    )}

    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div
          key={product._id}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
        >
          <div className="h-72 overflow-hidden bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-110"
            />
          </div>

          <div className="p-6">
            <p className="text-sm text-orange-500">
              {product.category}
            </p>

            <h3 className="mt-3 text-xl font-bold tracking-tight text-gray-900 transition group-hover:text-orange-500">
              {product.name}
            </h3>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
              {product.description}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xl font-extrabold tracking-tight text-orange-600">
                {product.price.toLocaleString()} EGP
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} In Stock`
                  : "Out of Stock"}
              </span>
            </div>

            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="mt-6 w-full rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white transition duration-300 hover:bg-orange-500 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
</main>

     <footer
  id="about"
  className="border-t border-gray-200 bg-gray-950 px-6 py-12 text-center text-sm text-gray-400"
>
  <h2 className="text-2xl font-extrabold tracking-widest text-white">
    AURA<span className="text-orange-500">.</span>
  </h2>

  <p className="mt-4 text-gray-400">
    Discover your style. Experience the difference.
  </p>

  <div className="mt-6 flex justify-center gap-6">
    <a href="#" className="transition hover:text-orange-500">
      Home
    </a>
    <a href="#products" className="transition hover:text-orange-500">
      Shop
    </a>
    <a href="#about" className="transition hover:text-orange-500">
      About
    </a>
  </div>

  <div className="mt-8 border-t border-gray-800 pt-6">
    © 2026 AURA Store. All rights reserved.
  </div>
</footer>
             </div>
        }
      />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
