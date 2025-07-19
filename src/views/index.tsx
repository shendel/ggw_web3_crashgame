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

import RootWrapper from '@/components/crashgame/RootWrapper'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

import NETWORKS from '@/contstans/NETWORKS'

import { TITLE } from '@/config'

function MyCrashGame(pageProps) {
  const viewsPaths = {
    '/': Home,
    '/admin': Admin,
    '/admin/players/': AdminPlayers,
    '/admin/players/:page': AdminPlayers,
    '/admin/games/': AdminGames,
    '/admin/games/:page': AdminGames,
    '/admin/playergames/:playerAddress': AdminGames,
    '/admin/playergames/:playerAddress/:page': AdminGames,
    '/about': MarkDownViewer({
      title: `About - ${TITLE}`,
      url: './about.md'
    }),
  }

  return (
    <RootWrapper>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto p-1 max-sm:p-4 max-sm:mt-6 max-sm:pt-10 flex-grow">
          <HashRouterViews
            views={{
              ...viewsPaths,
            }}
            props={{
            }}
            on404={Page404}
          />
        </div>
        <Footer />
      </div>
    </RootWrapper>
  )
}

export default MyCrashGame;
