import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { Page } from '../components'
import { Home } from './pages'
import './styles.css'
import { Navigate, Route, Routes, useNavigate } from 'react-router'


const Popup: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'VERIFICATION_FINISHED':
        default:
          console.log({ request })
      }
    })
    
  }, [])

  return (
    <Page>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  )
}

export default Popup