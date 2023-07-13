import React from 'react'
import Layout from '../../components/Layout/Layout'
import TransporterMenu from '../../components/Layout/TransporterMenu'
import { useAuth } from '../../context/auth'
const TransporterDashboard = () => {
  const[auth] = useAuth()
  return (
    <Layout title={"Dashboard-Transporter"}>
      <div className='container-fluid m-3 p-3 dashboard' style={{background:'#e6e6fa'}}>
        <div className='row'>
          <div className='col-md-3'>
            <TransporterMenu/>
          </div>
          <div className='col-md-9'>
            <div className='card w-75 p-3'>
              <h4>Transporter Name:{auth?.user?.name}</h4>
              <h4>Transporter Email:{auth?.user?.email}</h4>
              <h4>Transporter Phone:{auth?.user?.phone}</h4>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default TransporterDashboard
