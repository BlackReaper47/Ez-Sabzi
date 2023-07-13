import React, { useEffect, useState } from "react";
import UserMenu from "../../components/Layout/UserMenu.js";
import Layout from "../../components/Layout/Layout.js";
import axios from "axios";
import moment from 'moment'
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.js";

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [auth, setAuth] = useAuth()
  const navigate = useNavigate();

  const getOrders = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/auth/orders`)
      setOrders(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (auth?.token) getOrders()
  }, [])

  const handleDelete = async (orderId) => {
    try {
      let answer = window.prompt("Are you Sure?")
      if (!answer) return;
      const { data } = await axios.delete(`${process.env.REACT_APP_API}/api/v1/auth/delete-order/${orderId}`)
      toast.success("Order Deleted successfully")
      navigate('/dashboard/user/orders')
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }
  }

  return (
    <Layout title={"Your Orders"}>
      <div className="container-fluid p-3 m-3 dashboard" style={{ background: '#e6e6fa' }}>
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <h1>All Orders</h1>
            {
              orders?.map((o, i) => (
                <div className="border shadow" key={o._id}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Status</th>
                        <th scope='col'>Buyer</th>
                        <th scope='col'>Seller</th>
                        <th scope='col'>Date</th>
                        <th scope='col'>Payment</th>
                        <th scope='col'>Quantity</th>
                        {o?.status === "Not Processed" && (
                          <th scope='col'>
                            <button className="btn btn-danger" onClick={() => handleDelete(o._id)}>
                              Cancel Order
                            </button>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>{i + 1}</th>
                        <th>{o?.status}</th>
                        <th>{o?.buyer?.name}</th>
                        <th>{o?.products?.[0]?.seller?.name}</th>
                        <th>{moment(o?.createdAt).fromNow()}</th>
                        <th>{o?.payment.success ? "Success" : "Failed"}</th>
                        <th>{o?.products?.length}</th>
                      </tr>
                    </tbody>
                  </table>
                  <div className="container">
                    {o?.products?.map((p, i) => (
                      <div className="row mb-2 p-3 card flex-row" key={p._id}>
                        <div className="col-md-4">
                          <img
                            src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                            className="card-img-top"
                            alt={p.name}
                            width="100px"
                            height={"100px"}
                          />
                        </div>
                        <div className="col-md-8">
                          <p>{p.name}</p>
                          <p>{p.description.substring(0, 30)}</p>
                          <p>Price : {p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
