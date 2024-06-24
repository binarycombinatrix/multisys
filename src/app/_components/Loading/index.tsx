'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

const Providers = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar height="10px" color="#0521f2" shallowRouting />
    </>
  )
}

export default Providers
