import type { AppProps } from "next/app"
import Head from 'next/head'
import getConfig from 'next/config'


import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import AppRootWrapper from '@/components/AppRootWrapper'
import WpAdminView from '@/views/WpAdminView'

import {
  TITLE
} from '@/config'
function MyApp(pageProps) {

  
  return (
    <>
      <AppRootWrapper>
        <WpAdminView />
      </AppRootWrapper>
    </>
  )
}

export default MyApp;
