import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { useEffect, useState } from "react";

import { ShopAuthProvider } from "./context/ShopAuthContext";
import RequireCustomerAuth from "./components/RequireCustomerAuth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";

import type {
  CartItem,
  Product,
} from "./types";

function AppShell() {

  const [cart, setCart] =
    useState<CartItem[]>(() => {

      const saved =
        localStorage.getItem(
          "retailflow-cart"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  useEffect(() => {

    localStorage.setItem(
      "retailflow-cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  function addToCart(
    product: Product,
    quantity = 1
  ) {

    setCart((current) => {

      const existing =
        current.find(
          (item) =>
            item.product.id ===
            product.id
        );

      if (existing) {

        const stock =
          product.inventory
            ?.quantity ?? 0;

        return current.map(
          (item) =>
            item.product.id ===
            product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    stock,
                    item.quantity +
                      quantity
                  ),
                }
              : item
        );
      }

      return [
        ...current,
        {
          product,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(
    productId: number,
    quantity: number
  ) {

    setCart((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(
    productId: number
  ) {

    setCart((current) =>
      current.filter(
        (item) =>
          item.product.id !==
          productId
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + item.quantity,
    0
  );

  return (
    <BrowserRouter>

      <Navbar cartCount={cartCount} />

      <main className="min-h-[calc(100vh-64px)] bg-zinc-50">

        <Routes>

          <Route
            path="/"
            element={
              <Home
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/products"
            element={
              <Products
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/products/:id"
            element={
              <ProductDetails
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                onUpdateQuantity={
                  updateQuantity
                }
                onRemove={
                  removeFromCart
                }
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                onClearCart={clearCart}
              />
            }
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<RequireCustomerAuth />}>
            <Route path="/account" element={<Account />} />
            <Route
              path="/account/orders/:id"
              element={<OrderDetail />}
            />
          </Route>

        </Routes>

      </main>

    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ShopAuthProvider>
      <AppShell />
    </ShopAuthProvider>
  );
}