import type { AppProps } from "next/app"
import Head from 'next/head'
import getConfig from 'next/config'


import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import HashRouterViews from '@/components/HashRouterViews'

import Home from '@/views/Home'
import Admin from '@/views/Admin'
import AdminPlayers from '@/views/AdminPlayers'
import AdminGames from '@/views/AdminGames'

import MarkDownViewer from '@/views/MarkDownViewer'


import Page404 from '@/pages/404'

import AppRootWrapper from '@/components/AppRootWrapper'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

import NETWORKS from '@/contstans/NETWORKS'

import { TITLE } from '@/config'

function WpAdminView(pageProps) {
  const viewsPaths = {
    '/': Admin,
    '/admin': Admin,
    '/admin/players/': AdminPlayers,
    '/admin/players/:page': AdminPlayers,
    '/admin/games/': AdminGames,
    '/admin/games/:page': AdminGames,
    '/admin/playergames/:playerAddress': AdminGames,
    '/admin/playergames/:playerAddress/:page': AdminGames,
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto flex-grow">
          <HashRouterViews
            views={{
              ...viewsPaths,
            }}
            props={{
            }}
            on404={Page404}
          />
        </div>
      </div>
    </>
  )
}

export default WpAdminView;
