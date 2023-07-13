import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { AiFillWarning } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import { ListGroupItem, Col } from 'react-bootstrap';
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate the sub total amount of items
  const calculateSubTotal = () => {
    try {
      let subTotal = 0;
      cart?.map((item) => {
        subTotal += item.price * item.quantity; // Use the quantity stored in the cart
      });
      return subTotal;
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate the net total including the delivery fee
  const calculateNetTotal = () => {
    const subTotal = calculateSubTotal();
    const deliveryFee = 100;
    return subTotal + deliveryFee;
  };

  // Delete item from cart
  const removeCartItem = (productId) => {
    try {
      const updatedCart = cart.filter((item) => item._id !== productId);
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.log(error);
    }
  };

  // Get payment gateway token
  const getToken = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/braintree/token`);
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getToken();
  }, [auth?.token]);

  // Handle payments
  const handlePayment = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/product/braintree/payment`, {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment Completed Successfully");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const increaseQuantity = (productId) => {
    const product = cart.find((item) => item._id === productId);
  
    if (product && product.quantity > (product.quantityInCart || 0)) {
      const updatedQuantities = {
        ...selectedQuantities,
        [productId]: (selectedQuantities[productId] || 0) + 1,
      };
      setSelectedQuantities(updatedQuantities);
    }
  };

  const decreaseQuantity = (productId) => {
    const updatedQuantities = {
      ...selectedQuantities,
      [productId]: Math.max((selectedQuantities[productId] || 0) - 1, 0),
    };
    setSelectedQuantities(updatedQuantities);
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

 useEffect(() => {
  const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
  setCart(storedCart);

  const initialQuantities = storedCart.reduce((quantities, item) => {
    quantities[item._id] = item.quantityInCart || 0;
    return quantities;
  }, {});

  setSelectedQuantities(initialQuantities);
}, [setCart]);



  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} item(s) in your cart ${auth?.token ? "" : "please login to checkout!"}`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {cart?.map((p) => (
                <div className=" card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <h6>{p.name}</h6>
                    <h6>{p.description.substring(0, 30)}</h6>
                    <h6>Price: PKR {p.price}</h6>
                    <span>
                      <h6>
                        Quantity:{" "}
                        {p.quantity > 0 && (
                          <ListGroupItem className="d-inline-flex">
                            <Col className="d-flex align-items-center">
                              <button
                                className="btn btn-sm btn-secondary me-2"
                                onClick={() => decreaseQuantity(p._id)}
                                disabled={(selectedQuantities[p._id] || 0) === 0}
                              >
                                -
                              </button>
                              <span>
                                { p.quantity}
                              </span>
                              <button
                                className="btn btn-sm btn-secondary ms-2"
                                onClick={() => increaseQuantity(p._id)}
                                disabled={
                                  (selectedQuantities[p._id] || 0) >= p.quantity
                                }
                              >
                                +
                              </button>
                            </Col>
                          </ListGroupItem>
                        )}
                      </h6>
                    </span>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />

              <h5>
                Sub Total:{" "}
                {calculateSubTotal().toLocaleString("en-US", {
                  style: "currency",
                  currency: "PKR",
                })}
              </h5>
              <h5>Delivery Fee: 100 PKR</h5>
              <h4>
                Net Total:{" "}
                {calculateNetTotal().toLocaleString("en-US", {
                  style: "currency",
                  currency: "PKR",
                })}
              </h4>
              <hr />

              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Current Address</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Please Login to Checkout
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2">
                {!clientToken || !auth?.token || !cart?.length ? (
                  ""
                ) : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: "vault",
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />

                    <button
                      className="btn btn-primary"
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Processing ..." : "Make Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
