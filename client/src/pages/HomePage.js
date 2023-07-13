import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepage.css";
import { useAuth } from "../context/auth";
import { Form, ListGroupItem, Row, Col } from 'react-bootstrap';
const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [selectedQty, setSelectedQty] = useState(1);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useAuth();


  //get all cat
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);
  //get products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  //getTOtal COunt
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/product-count`);
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);
  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // filter by cat
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };
  useEffect(() => {
    if (!checked.length || !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
  if (checked.length || radio.length) filterProduct();
}, [checked, radio, cart]);


  //get filterd product
  const filterProduct = async () => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/product/product-filters`, {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };



 // handle cart
const handleAddToCart = (product) => {
  const existingCartItem = cart.find((item) => item._id === product._id);
  const availableQty = product.quantity - (existingCartItem?.quantity || 0);

  if (selectedQty >= 1 && selectedQty <= availableQty && availableQty > 0) {
    let updatedCart = [];

    if (existingCartItem) {
      updatedCart = cart.map((item) => {
        if (item._id === product._id) {
          return { ...item, quantity: item.quantity + selectedQty };
        }
        return item;
      });
    } else {
      const updatedCartItem = { ...product, quantity: selectedQty };
      updatedCart = [...cart, updatedCartItem];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item Added to cart");

    if (selectedQty === availableQty && availableQty !== 0) {
      const updatedProducts = products.map((p) => {
        if (p._id === product._id) {
          return { ...p, quantity: 0 };
        }
        return p;
      });
      setProducts(updatedProducts);
    }
  } else if (availableQty === 0) {
    toast.error("Item is out of stock");
  } else if (selectedQty <= 0) {
    toast.error("Please select a valid quantity");
  } else {
    toast.error(`Only ${availableQty} item(s) available`);
  }
};

  







  return (
    <Layout title={"Ez-Sabzi - Where we sell Quality"}>
      {/* banner image */}
      <img
        src="/images/banner.jpg"
        className="banner-img"
        alt="bannerimage"
        height='500px'
        width='90%'
        style={{ marginTop: "100px", marginLeft: "80px" }}
      />
      {/* banner image */}
      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>
          {/* price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
          <div className="d-flex flex-column">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              RESET FILTERS
            </button>
          </div>
        </div>
        <div className="col-md-9 ">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div className="card m-2" key={p._id}>
                <img
                  src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <div className="card-name-price">
                    <h5 className="card-title">{p.name}</h5>
                    <h5 className="card-title card-price">
                      {p.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "PKR",
                      })}/KG
                    </h5>
                  </div>
                  <p className="card-text ">
                    {p.description.substring(0, 60)}...
                  </p>
                  <h5 className="card-text">
                    Status:
                    <span style={{ color: p.quantity > 0 ? "green" : "red" }}>
                      {p.quantity > 0 ? " In Stock" : " Out of Stock"}
                    </span>
                  </h5>
                  {auth?.user?.role === 0 && (
                    <h6 className="card-text">
                      {p.quantity > 0 && (
                        <ListGroupItem>
                          <Row>
                            <Col>Qty
                            </Col>
                            <Form.Control
                              as="select"
                              value={selectedQty}
                              onChange={(e) => setSelectedQty(parseInt(e.target.value))}
                            >
                              {[...Array(p.quantity)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>
                                  {index + 1}
                                </option>
                              ))}
                            </Form.Control>

                          </Row>
                        </ListGroupItem>

                      )}
                    </h6>)}
                  <div className="card-name-price">
                    <button
                      className="btn btn-info ms-1"
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      More Details
                    </button>
                    {auth?.user?.role === 0 && (
                      <button
                        className="btn btn-dark ms-1"
                        onClick={() => handleAddToCart(p)}
                      >
                        ADD TO CART
                      </button>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? (
                  "Loading ..."
                ) : (
                  <>
                    {" "}
                    Loadmore <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
