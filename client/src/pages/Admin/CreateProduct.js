import React, { useState, useEffect } from 'react'
import AdminMenu from '../../components/Layout/AdminMenu'
import Layout from '../../components/Layout/Layout'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Select } from 'antd'
import { useNavigate } from 'react-router-dom'
const { Option } = Select


const CreateProduct = () => {

    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [photo, setPhoto] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('')
    const [quantity, setQuantity] = useState('')
    const [shipping, setShipping] = useState('')

    //get all Categories
    const getAllCategory = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/category/get-category`)
            if (data?.success) {
                setCategories(data?.category);
            }
        } catch (error) {
            console.log(error)
            toast.error("Something Went Wrong")
        }
    }

    useEffect(() => {
        getAllCategory()
    }, [])

    //create product
    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            const productData = new FormData()
            productData.append('name', name)
            productData.append('description', description)
            productData.append('price', price)
            productData.append('quantity', quantity)
            productData.append('photo', photo)
            productData.append('category', category)
            const { data } = axios.post(`${process.env.REACT_APP_API}/api/v1/product/create-product`, productData)
            if (data?.success) {
                toast.error(data?.message)
            }
            else {
                toast.success('Product Created Successfully')
                navigate('/dashboard/admin/products')

            }
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong')
        }
    }


    return (
        <Layout title={"Create Products"}>
            <div className='container-fluid m-3 p-3 dashboard'>
                <div className='row'>
                    <div className='col-md-3'>
                        <AdminMenu />
                    </div>
                    <div className='col-md-9'><h3>YOUR Products</h3>
                        <div className='m-1 w-50'>
                            <Select bordered={false}
                                placeholder="Select a Category"
                                size="large"
                                showSearch
                                className='form-select mb-3' onChange={(value) => { setCategory(value) }}>
                                {categories?.map(c => (
                                    <Option key={c._id} value={c._id}> {c.name} </Option>
                                ))}
                            </Select>
                            <div className='mb-3'>
                                <label className='btn btn-outline-secondary col-md-12'>
                                    {photo ? photo.name : "Upload Image"}
                                    <input type="file"
                                        name='photo'
                                        accept='image/*'
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                        hidden />
                                </label>
                            </div>
                            <div className='mb-3'>
                                {photo && (
                                    <div className='text-center'>
                                        <img src={URL.createObjectURL(photo)}
                                            alt='product'
                                            height={'300px'}
                                            className='img img-responsive' />
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <input
                                    type='text'
                                    value={name}
                                    placeholder="Write Product Name"
                                    className='form-control'
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <textarea
                                    value={description}
                                    placeholder="Write Product Description"
                                    className='form-control'
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <input
                                    type='Number'
                                    value={price}
                                    placeholder="Write Product Price"
                                    className='form-control'
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <input
                                    type='Number'
                                    value={quantity}
                                    placeholder="Write Product Quantity"
                                    className='form-control'
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className='mb-3'>
                                <Select
                                    bordered={false}
                                    size='large'
                                    showSearch
                                    className='form-select mb-3'
                                    placeholder="Is Delivery Available"
                                    onChange={(value) => setShipping(value)}
                                >
                                    <Option value='0'>NO</Option>
                                    <Option value='1'>YES</Option>
                                </Select>
                            </div>
                            <div className='mb-3'>
                                <button className='btn btn-primary' onClick={handleCreate}>Create Product</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CreateProduct
