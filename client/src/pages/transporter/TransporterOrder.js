import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TransporterMenu from "../../components/Layout/TransporterMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { Select } from "antd";
const { Option } = Select;

const AdminOrders = () => {
  const [status, setStatus] = useState(["Delivering", "Delivered"]);
  const [changeStatus, setChangeStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [auth, setAuth] = useAuth();

  const getOrders = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/auth/all-orders`);
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const handleChange = async (orderId, value) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (order.status === "Delivered") {
        toast.error("Cannot change status. Order has already been delivered.");
        return;
      }

      const { data } = await axios.put(`${process.env.REACT_APP_API}/api/v1/auth/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewOrder = async (orderId) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      setSelectedOrder(null);
    } else {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/auth/get-order/${orderId}`);
        setSelectedOrder(data.order);
        setSelectedOrderId(orderId);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Layout title={"All Orders Data"}>
      <div className="container-fluid p-3 m-3 dashboard">
        <div className="row dashboard">
          <div className="col-md-3">
            <TransporterMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center">All Orders</h1>
            {orders?.map((o, i) => {
              const isOrderSelected = o._id === selectedOrderId;
              return (
                <div className="border shadow" key={o._id}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Status</th>
                        <th scope="col">Buyer</th>
                        <th scope="col">Seller</th>
                        <th scope="col">Date</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td>
                          <Select
                            bordered={false}
                            onChange={(value) => handleChange(o._id, value)}
                            defaultValue={o?.status}
                            disabled={o?.status === "Delivered"}
                          >
                            {status.map((s, i) => (
                              <Option key={i} value={s}>
                                {s}
                              </Option>
                            ))}
                          </Select>
                        </td>
                        <td>{o?.buyer?.name}</td>
                        <td>{o?.products?.[0]?.seller?.name}</td>
                        <td>{moment(o?.createdAt).fromNow()}</td>
                        <td>{o?.payment.success ? "Success" : "Failed"}</td>
                        <td>{o?.products?.length}</td>
                        <td>
                          <button className="btn btn-primary" onClick={() => handleViewOrder(o._id)}>
                            {isOrderSelected ? "Close Order" : "View Order"}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {isOrderSelected && (
                    <div className="container">
                      <div>
                        <p>Buyer Name: {selectedOrder.buyer?.name}</p>
                        <p>Buyer Address: {selectedOrder.buyer?.address}</p>
                        <p>Buyer Number: {selectedOrder.buyer?.phone}</p>
                        <p>Seller Name: {selectedOrder.products[0]?.seller?.name}</p>
                        <p>Seller Address: {selectedOrder.products[0]?.seller?.address}</p>
                        <p>Seller Number: {selectedOrder.products[0]?.seller?.phone}</p>
                        <h4>Products:</h4>
                        {selectedOrder.products.map((p) => (
                          <div key={p._id} className="row mb-2 p-3 card flex-row">
                            <div className="col-md-4">
                              <img
                                src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                                className="card-img-top"
                                alt={p.name}
                                width="100px"
                                height="100px"
                              />
                            </div>
                            <div className="col-md-8">
                              <p>Product Name: {p.name}</p>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
